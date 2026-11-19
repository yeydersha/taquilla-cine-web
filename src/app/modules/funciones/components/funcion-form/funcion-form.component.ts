import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { FuncionRequest, FuncionResponse, PeliculaResponse } from '../../../../models';

type CampoFuncion = 'peliculaId' | 'fecha' | 'hora' | 'sala' | 'precio' | 'cuposTotales';

interface MensajesCampo {
  obligatorio: string;
  soloEspacios?: string;
  maxlength?: string;
  min?: string;
  pattern?: string;
  max?: string;
  fechaInvalida?: string;
  horaInvalida?: string;
  precioInvalido?: string;
  cuposInvalidos?: string;
}

/** Límite del tipo INTEGER de PostgreSQL para cupos. */
const CUPOS_MAXIMO = 2147483647;

/** Límite para precio NUMERIC(12,2): 10 dígitos enteros + 2 decimales = 9999999999.99 */
const PRECIO_MAXIMO = 9999999999.99;

const MENSAJES: Record<CampoFuncion, MensajesCampo> = {
  peliculaId: {
    obligatorio: 'Debe seleccionar una película.',
  },
  fecha: {
    obligatorio: 'La fecha es obligatoria.',
    fechaInvalida: 'La fecha no tiene un formato válido (YYYY-MM-DD).',
  },
  hora: {
    obligatorio: 'La hora es obligatoria.',
    horaInvalida: 'La hora no tiene un formato válido (HH:mm).',
  },
  sala: {
    obligatorio: 'La sala es obligatoria.',
    soloEspacios: 'La sala no puede contener solo espacios.',
    maxlength: 'La sala no puede superar los 50 caracteres.',
  },
  precio: {
    obligatorio: 'El precio es obligatorio.',
    min: 'El precio debe ser mayor que cero.',
    pattern: 'El precio debe tener como máximo dos decimales.',
    max: 'El precio supera el límite permitido (9999999999.99).',
    precioInvalido: 'El precio debe ser un número positivo con hasta dos decimales.',
  },
  cuposTotales: {
    obligatorio: 'Los cupos totales son obligatorios.',
    min: 'Los cupos totales deben ser mayores que cero.',
    pattern: 'Los cupos totales deben ser un número entero.',
    max: 'Los cupos totales superan el límite del sistema.',
    cuposInvalidos: 'Los cupos totales deben ser un número entero mayor que cero.',
  },
};

/** Rechaza cadenas formadas únicamente por espacios. */
function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  if (typeof valor !== 'string') {
    return null;
  }

  return valor.trim().length === 0 ? { soloEspacios: true } : null;
}

/** Valida formato de fecha YYYY-MM-DD. */
function fechaValida(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  if (!valor || typeof valor !== 'string') {
    return null;
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(valor)) {
    return { fechaInvalida: true };
  }

  const fecha = new Date(valor + 'T00:00:00');
  const partes = valor.split('-').map(Number);
  if (Number.isNaN(fecha.getTime()) || fecha.getFullYear() !== partes[0] || fecha.getMonth() + 1 !== partes[1] || fecha.getDate() !== partes[2]) {
    return { fechaInvalida: true };
  }

  return null;
}

/** Valida formato de hora HH:mm. */
function horaValida(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  if (!valor || typeof valor !== 'string') {
    return null;
  }

  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(valor)) {
    return { horaInvalida: true };
  }

  return null;
}

/** Valida precio: número positivo con hasta 2 decimales, máx NUMERIC(12,2). */
function precioValido(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const num = Number(valor);
  if (Number.isNaN(num)) {
    return { precioInvalido: true };
  }

  if (num <= 0) {
    return { min: true };
  }

  if (num > PRECIO_MAXIMO) {
    return { max: true };
  }

  // Verificar que tiene máximo 2 decimales
  const decimales = (valor.toString().split('.')[1] || '').length;
  if (decimales > 2) {
    return { pattern: true };
  }

  return null;
}

/** Valida cupos totales: entero positivo. */
function cuposValidos(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;

  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const num = Number(valor);
  if (Number.isNaN(num) || !Number.isInteger(num)) {
    return { cuposInvalidos: true };
  }

  if (num <= 0) {
    return { min: true };
  }

  if (num > CUPOS_MAXIMO) {
    return { max: true };
  }

  return null;
}

/**
 * Formulario reutilizable para crear y editar funciones.
 *
 * No realiza peticiones HTTP: valida los datos y los entrega al componente
 * de funciones mediante el evento `guardar`.
 */
@Component({
  selector: 'app-funcion-form',
  standalone: false,
  templateUrl: './funcion-form.component.html',
  styleUrl: './funcion-form.component.css',
})
export class FuncionFormComponent implements OnChanges {
  /** Función a editar. `null` significa que el formulario crea una nueva. */
  @Input() funcion: FuncionResponse | null = null;
  /** Lista de películas disponibles para el selector. */
  @Input() peliculas: PeliculaResponse[] = [];
  /** Mientras es `true`, el formulario está enviando y bloquea nuevos envíos. */
  @Input() guardando = false;
  /** Errores de validación devueltos por el backend, indexados por campo. */
  @Input() erroresServidor: Record<string, string> | null = null;

  @Output() guardar = new EventEmitter<FuncionRequest>();
  @Output() cancelar = new EventEmitter<void>();

  public readonly formulario: FormGroup;
  protected intentoGuardar = false;

  constructor(private readonly fb: FormBuilder) {
    this.formulario = this.fb.group({
      peliculaId: [null, [Validators.required]],
      fecha: ['', [Validators.required, fechaValida]],
      hora: ['', [Validators.required, horaValida]],
      sala: ['', [Validators.required, noSoloEspacios, Validators.maxLength(50)]],
      precio: [null, [Validators.required, precioValido]],
      cuposTotales: [null, [Validators.required, cuposValidos]],
    });
  }

  get esEdicion(): boolean {
    return this.funcion !== null;
  }

  /** Información de solo lectura para mostrar en modo edición. */
  get cuposDisponibles(): number | null {
    return this.funcion?.cuposDisponibles ?? null;
  }

  get cuposVendidos(): number | null {
    if (!this.funcion) return null;
    return this.funcion.cuposTotales - this.funcion.cuposDisponibles;
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['funcion'] && !cambios['peliculas']) {
      return;
    }

    this.intentoGuardar = false;
    this.formulario.reset({
      peliculaId: null,
      fecha: '',
      hora: '',
      sala: '',
      precio: null,
      cuposTotales: null,
    });

    if (this.funcion) {
      // Convertir hora de HH:mm:ss a HH:mm si es necesario
      let horaFormato = this.funcion.hora;
      if (horaFormato.length > 5) {
        horaFormato = horaFormato.substring(0, 5);
      }

      this.formulario.setValue({
        peliculaId: this.funcion.peliculaId,
        fecha: this.funcion.fecha,
        hora: horaFormato,
        sala: this.funcion.sala,
        precio: this.funcion.precio,
        cuposTotales: this.funcion.cuposTotales,
      });
    }

    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
  }

  protected enviar(): void {
    this.intentoGuardar = true;

    if (this.guardando) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue() as {
      peliculaId: number | null;
      fecha: string;
      hora: string;
      sala: string;
      precio: number | null;
      cuposTotales: number | null;
    };

    this.guardar.emit({
      peliculaId: Number(valores.peliculaId),
      fecha: valores.fecha,
      hora: valores.hora,
      sala: valores.sala.trim(),
      precio: Number(valores.precio),
      cuposTotales: Number(valores.cuposTotales),
    });
  }

  /** Mensaje que debe mostrarse bajo el campo, o `null` si es válido. */
  protected mensajeDe(campo: CampoFuncion): string | null {
    const control = this.formulario.get(campo);

    if (!control || !(this.intentoGuardar || control.touched)) {
      return null;
    }

    const mensajeServidor = this.erroresServidor?.[campo];

    if (mensajeServidor) {
      return mensajeServidor;
    }

    if (control.hasError('required')) {
      return MENSAJES[campo].obligatorio;
    }

    if (control.hasError('soloEspacios')) {
      return MENSAJES[campo].soloEspacios ?? '';
    }

    if (control.hasError('maxlength')) {
      return MENSAJES[campo].maxlength ?? '';
    }

    if (control.hasError('fechaInvalida')) {
      return MENSAJES[campo].fechaInvalida ?? '';
    }

    if (control.hasError('horaInvalida')) {
      return MENSAJES[campo].horaInvalida ?? '';
    }

    if (control.hasError('precioInvalido') || control.hasError('pattern')) {
      return MENSAJES[campo].precioInvalido ?? MENSAJES[campo].pattern ?? '';
    }

    if (control.hasError('min')) {
      return MENSAJES[campo].min ?? '';
    }

    if (control.hasError('max')) {
      return MENSAJES[campo].max ?? '';
    }

    if (control.hasError('cuposInvalidos')) {
      return MENSAJES[campo].cuposInvalidos ?? '';
    }

    return null;
  }
}