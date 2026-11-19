import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { PeliculaRequest, PeliculaResponse } from '../../../../models';

type CampoPelicula = 'titulo' | 'genero' | 'duracionMin' | 'clasificacion';

interface MensajesCampo {
  obligatorio: string;
  soloEspacios: string;
  maxlength: string;
}

/** Límite del tipo INTEGER de PostgreSQL. */
const DURACION_MAXIMA = 2147483647;

const MENSAJES: Record<CampoPelicula, MensajesCampo> = {
  titulo: {
    obligatorio: 'El título es obligatorio.',
    soloEspacios: 'El título no puede contener solo espacios.',
    maxlength: 'El título no puede superar los 150 caracteres.',
  },
  genero: {
    obligatorio: 'El género es obligatorio.',
    soloEspacios: 'El género no puede contener solo espacios.',
    maxlength: 'El género no puede superar los 80 caracteres.',
  },
  duracionMin: {
    obligatorio: 'La duración es obligatoria.',
    soloEspacios: 'La duración debe ser un número entero.',
    maxlength: 'La duración es demasiado grande para el sistema.',
  },
  clasificacion: {
    obligatorio: 'La clasificación es obligatoria.',
    soloEspacios: 'La clasificación no puede contener solo espacios.',
    maxlength: 'La clasificación no puede superar los 20 caracteres.',
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

/**
 * Formulario reutilizable para crear y editar películas.
 *
 * No realiza peticiones HTTP: valida los datos y los entrega al componente
 * de películas mediante el evento `guardar`.
 */
@Component({
  selector: 'app-pelicula-form',
  standalone: false,
  templateUrl: './pelicula-form.component.html',
  styleUrl: './pelicula-form.component.css',
})
export class PeliculaFormComponent implements OnChanges {
  /** Película a editar. `null` significa que el formulario crea una nueva. */
  @Input() pelicula: PeliculaResponse | null = null;
  /** Mientras es `true`, el formulario está enviando y bloquea nuevos envíos. */
  @Input() guardando = false;
  /** Errores de validación devueltos por el backend, indexados por campo. */
  @Input() erroresServidor: Record<string, string> | null = null;

  @Output() guardar = new EventEmitter<PeliculaRequest>();
  @Output() cancelar = new EventEmitter<void>();

  public readonly formulario: FormGroup;
  protected intentoGuardar = false;

  constructor(private readonly fb: FormBuilder) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, noSoloEspacios, Validators.maxLength(150)]],
      genero: ['', [Validators.required, noSoloEspacios, Validators.maxLength(80)]],
      duracionMin: [
        null,
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.min(1),
          Validators.max(DURACION_MAXIMA),
        ],
      ],
      clasificacion: ['', [Validators.required, noSoloEspacios, Validators.maxLength(20)]],
    });
  }

  get esEdicion(): boolean {
    return this.pelicula !== null;
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['pelicula']) {
      return;
    }

    this.intentoGuardar = false;
    this.formulario.reset({ titulo: '', genero: '', duracionMin: null, clasificacion: '' });

    if (this.pelicula) {
      this.formulario.setValue({
        titulo: this.pelicula.titulo,
        genero: this.pelicula.genero,
        duracionMin: this.pelicula.duracionMin,
        clasificacion: this.pelicula.clasificacion,
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
      titulo: string;
      genero: string;
      duracionMin: number | null;
      clasificacion: string;
    };

    this.guardar.emit({
      titulo: valores.titulo.trim(),
      genero: valores.genero.trim(),
      duracionMin: Number(valores.duracionMin),
      clasificacion: valores.clasificacion.trim(),
    });
  }

  /** Mensaje que debe mostrarse bajo el campo, o `null` si es válido. */
  protected mensajeDe(campo: CampoPelicula): string | null {
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
      return MENSAJES[campo].soloEspacios;
    }

    if (control.hasError('maxlength')) {
      return MENSAJES[campo].maxlength;
    }

    if (control.hasError('pattern')) {
      return 'La duración debe ser un número entero.';
    }

    if (control.hasError('min')) {
      return 'La duración debe ser mayor que cero.';
    }

    if (control.hasError('max')) {
      return 'La duración es demasiado grande para el sistema.';
    }

    return null;
  }
}
