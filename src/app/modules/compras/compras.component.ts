import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  CompraRequest,
  CompraResponse,
  FuncionResponse,
  ValidationErrorResponse,
} from '../../models';
import { CompraService } from '../../services/compra.service';
import { FuncionService } from '../../services/funcion.service';

type CampoCompra = 'funcionId' | 'nombreCliente' | 'cantidadBoletos';

interface MensajesCampo {
  obligatorio: string;
  soloEspacios?: string;
  maxlength?: string;
  min?: string;
  pattern?: string;
  max?: string;
  enteroPositivo?: string;
}

const MENSAJES: Record<CampoCompra, MensajesCampo> = {
  funcionId: {
    obligatorio: 'Debe seleccionar una función.',
  },
  nombreCliente: {
    obligatorio: 'El nombre del cliente es obligatorio.',
    soloEspacios: 'El nombre no puede contener solo espacios.',
    maxlength: 'El nombre no puede superar los 150 caracteres.',
  },
  cantidadBoletos: {
    obligatorio: 'La cantidad de boletos es obligatoria.',
    enteroPositivo: 'La cantidad debe ser un número entero mayor que cero.',
  },
};

/** Rechaza cadenas formadas únicamente por espacios. */
function noSoloEspacios(control: AbstractControl): { soloEspacios: true } | null {
  const valor = control.value;

  if (typeof valor !== 'string') {
    return null;
  }

  return valor.trim().length === 0 ? { soloEspacios: true } : null;
}

/** Valida que sea un número entero mayor que cero. */
function enteroPositivo(control: AbstractControl): { enteroPositivo: true } | null {
  const valor = control.value;

  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const num = Number(valor);
  if (Number.isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return { enteroPositivo: true };
  }

  return null;
}

/**
 * Pantalla principal del módulo de compras: formulario de registro y listado.
 */
@Component({
  selector: 'app-compras',
  standalone: false,
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css',
})
export class ComprasComponent implements OnInit {
  readonly funciones = signal<FuncionResponse[]>([]);
  readonly compras = signal<CompraResponse[]>([]);
  readonly cargandoFunciones = signal(true);
  readonly cargandoCompras = signal(true);
  readonly error = signal<string | null>(null);

  readonly exito = signal<string | null>(null);
  readonly errorOperacion = signal<string | null>(null);

  readonly guardando = signal(false);

  public readonly formulario: FormGroup;
  public intentoGuardar = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly compraService: CompraService,
    private readonly funcionService: FuncionService,
  ) {
    this.formulario = this.fb.group({
      funcionId: [null, [Validators.required]],
      nombreCliente: ['', [Validators.required, noSoloEspacios, Validators.maxLength(150)]],
      cantidadBoletos: [null, [Validators.required, enteroPositivo]],
    });
  }

  ngOnInit(): void {
    this.cargarFunciones();
    this.cargarCompras();
  }

  /** Carga las funciones disponibles para el selector. */
  private cargarFunciones(): void {
    this.cargandoFunciones.set(true);
    this.error.set(null);

    this.funcionService.listar().subscribe({
      next: (funciones) => {
        this.funciones.set(funciones);
        this.cargandoFunciones.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.describirError(error));
        this.cargandoFunciones.set(false);
      },
    });
  }

  /** Carga el listado de compras realizadas. */
  private cargarCompras(): void {
    this.cargandoCompras.set(true);
    this.compraService.listar().subscribe({
      next: (compras) => {
        this.compras.set(compras);
        this.cargandoCompras.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.describirError(error));
        this.cargandoCompras.set(false);
      },
    });
  }

  /** Obtiene el precio de la función seleccionada. */
  get precioFuncion(): number | null {
    const id = this.funcionIdControl?.value ? Number(this.funcionIdControl.value) : null;
    const f = this.funciones().find((fn) => fn.id === id);
    return f?.precio ?? null;
  }

  /** Obtiene los cupos disponibles de la función seleccionada. */
  get cuposDisponibles(): number | null {
    const id = this.funcionIdControl?.value ? Number(this.funcionIdControl.value) : null;
    const f = this.funciones().find((fn) => fn.id === id);
    return f?.cuposDisponibles ?? null;
  }

  /** Verifica si la función seleccionada tiene cupos insuficientes. */
  get cuposInsuficientes(): boolean {
    const precio = this.precioFuncion;
    const cupos = this.cuposDisponibles;
    const cantidad = this.cantidadBoletosControl?.value;
    return (
      precio !== null &&
      cupos !== null &&
      cantidad !== null &&
      cantidad > cupos
    );
  }

  /** Calcula el total estimado (informativo). */
  get totalEstimado(): number | null {
    const precio = this.precioFuncion;
    const cantidad = this.cantidadBoletosControl?.value;
    if (precio === null || cantidad === null) {
      return null;
    }
    return precio * cantidad;
  }

  /** Acceso al control funcionId. */
  get funcionIdControl(): AbstractControl | null {
    return this.formulario.get('funcionId');
  }

  /** Acceso al control nombreCliente. */
  get nombreClienteControl(): AbstractControl | null {
    return this.formulario.get('nombreCliente');
  }

  /** Acceso al control cantidadBoletos. */
  get cantidadBoletosControl(): AbstractControl | null {
    return this.formulario.get('cantidadBoletos');
  }

  /** Formatea un precio en pesos colombianos (sin símbolo de moneda para tests). */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(precio);
  }

  /** Formatea un precio en pesos colombianos solo números (para tests). */
  formatearPrecioSoloNumero(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  }

  /** Formatea la fecha de compra. */
  formatearFecha(fecha: string): string {
    try {
      const dt = new Date(fecha);
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(dt);
    } catch {
      return fecha;
    }
  }

  /** Envía la compra al backend. */
  registrar(): void {
    if (this.guardando()) {
      return;
    }

    this.intentoGuardar = true;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.cuposInsuficientes) {
      this.errorOperacion.set('Cupos insuficientes para la cantidad solicitada.');
      return;
    }

    const valores = this.formulario.getRawValue() as {
      funcionId: number | string | null;
      nombreCliente: string;
      cantidadBoletos: number | null;
    };

    const datos: CompraRequest = {
      funcionId: Number(valores.funcionId),
      nombreCliente: valores.nombreCliente.trim(),
      cantidadBoletos: valores.cantidadBoletos!,
    };

    this.guardando.set(true);
    this.limpiarMensajes();

    this.compraService.crear(datos).subscribe({
      next: (compra) => {
        this.guardando.set(false);
        this.exito.set(
          `Compra registrada correctamente. Total: ${this.formatearPrecio(compra.total)}`,
        );
        this.limpiarFormulario();
        this.cargarCompras();
        this.cargarFunciones();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorOperacion.set(this.describirError(error));
        this.aplicarErroresServidor(error);
      },
    });
  }

  /** Limpia el formulario después de una compra exitosa. */
  limpiarFormulario(): void {
    this.formulario.reset({
      funcionId: null,
      nombreCliente: '',
      cantidadBoletos: null,
    });
    this.intentoGuardar = false;
  }

  private limpiarMensajes(): void {
    this.exito.set(null);
    this.errorOperacion.set(null);
  }

  private aplicarErroresServidor(error: HttpErrorResponse): void {
    if (error.status !== 400) {
      return;
    }

    const cuerpo = error.error as Partial<ValidationErrorResponse> | null;
    const errores = cuerpo?.errores;

    if (errores && typeof errores === 'object' && Object.keys(errores).length > 0) {
      this.formulario.setErrors({ servidor: true });
      Object.entries(errores).forEach(([campo, mensaje]) => {
        const control = this.formulario.get(campo);
        if (control) {
          control.setErrors({ servidor: mensaje });
        }
      });
    }
  }

  /** Errores de validación por campo que puede devolver un HTTP 400. */
  private extraerErroresCampo(error: HttpErrorResponse): Record<string, string> | null {
    if (error.status !== 400) {
      return null;
    }

    const cuerpo = error.error as Partial<ValidationErrorResponse> | null;
    const errores = cuerpo?.errores;

    return errores && typeof errores === 'object' && Object.keys(errores).length > 0
      ? errores
      : null;
  }

  /** Traduce el error HTTP a un mensaje claro para el usuario. */
  private describirError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return `No se pudo conectar con el backend (${environment.apiUrl}). Verifique que Spring Boot esté en ejecución.`;
    }

    const cuerpo = error.error as Partial<{ mensaje: string }> | null;
    const mensaje = typeof cuerpo?.mensaje === 'string' ? cuerpo.mensaje : null;

    switch (error.status) {
      case 400:
        return mensaje ?? 'Los datos enviados no son válidos. Revise el formulario.';
      case 404:
        return mensaje ?? 'La función seleccionada no existe.';
      case 409:
        return mensaje ?? 'No hay cupos suficientes para la cantidad solicitada.';
      case 500:
        return 'El servidor no pudo completar la operación. Intente de nuevo más tarde.';
      default:
        return mensaje ?? `No se pudo completar la operación (HTTP ${error.status}).`;
    }
  }

  /** Obtiene el mensaje de error para un campo específico. */
  public mensajeDe(campo: CampoCompra): string | null {
    const control = this.formulario.get(campo);

    if (!control || !(this.intentoGuardar || control.touched)) {
      return null;
    }

    if (control.hasError('servidor')) {
      return control.getError('servidor');
    }

    if (control.hasError('required')) {
      return MENSAJES[campo].obligatorio;
    }

    if (control.hasError('soloEspacios')) {
      return MENSAJES[campo].soloEspacios ?? null;
    }

    if (control.hasError('maxlength')) {
      return MENSAJES[campo].maxlength ?? null;
    }

    if (control.hasError('enteroPositivo')) {
      return MENSAJES[campo].enteroPositivo ?? null;
    }

    return null;
  }

  /** Verifica si un campo tiene error. */
  protected tieneError(campo: CampoCompra): boolean {
    return !!this.mensajeDe(campo);
  }

  /** Obtiene los datos de una función por ID para el listado. */
  obtenerFuncion(id: number): FuncionResponse | undefined {
    return this.funciones().find((f) => f.id === id);
  }

  /** Convierte un valor a número de forma segura. */
  protected toNumber(value: unknown): number | null {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
}