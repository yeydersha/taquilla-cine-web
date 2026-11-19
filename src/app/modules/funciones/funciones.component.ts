import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  ErrorResponse,
  FuncionRequest,
  FuncionResponse,
  PeliculaResponse,
  ValidationErrorResponse,
} from '../../models';
import { FuncionService } from '../../services/funcion.service';
import { PeliculaService } from '../../services/pelicula.service';

type ModoFormulario = 'crear' | 'editar';

/**
 * Pantalla principal del módulo de funciones: listado, consulta, registro,
 * edición y eliminación. El formulario se delega a `FuncionFormComponent`.
 */
@Component({
  selector: 'app-funciones',
  standalone: false,
  templateUrl: './funciones.component.html',
  styleUrl: './funciones.component.css',
})
export class FuncionesComponent implements OnInit {
  readonly funciones = signal<FuncionResponse[]>([]);
  readonly peliculas = signal<PeliculaResponse[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly exito = signal<string | null>(null);
  readonly errorOperacion = signal<string | null>(null);

  readonly modoFormulario = signal<ModoFormulario | null>(null);
  readonly funcionEnEdicion = signal<FuncionResponse | null>(null);
  readonly erroresCampo = signal<Record<string, string> | null>(null);
  readonly guardando = signal(false);

  readonly detalle = signal<FuncionResponse | null>(null);
  readonly consultando = signal(false);

  readonly idConfirmacion = signal<number | null>(null);
  readonly eliminando = signal(false);

  constructor(
    private readonly funcionService: FuncionService,
    private readonly peliculaService: PeliculaService,
  ) {}

  ngOnInit(): void {
    this.cargarPeliculas();
    this.cargarFunciones();
  }

  /** Carga las películas para el selector del formulario. */
  private cargarPeliculas(): void {
    this.peliculaService.listar().subscribe({
      next: (peliculas) => {
        this.peliculas.set(peliculas);
      },
      error: (error: HttpErrorResponse) => {
        console.warn('No se pudieron cargar las películas:', this.describirError(error));
      },
    });
  }

  /** Abre el formulario vacío para registrar una función. */
  abrirCreacion(): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(null);

    if (this.modoFormulario() === 'crear') {
      return;
    }

    this.detalle.set(null);
    this.funcionEnEdicion.set(null);
    this.modoFormulario.set('crear');
  }

  /** Consulta la función por ID y carga sus datos en el formulario. */
  editar(funcion: FuncionResponse): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(null);
    this.consultando.set(true);

    this.funcionService.consultarPorId(funcion.id).subscribe({
      next: (encontrada) => {
        this.consultando.set(false);
        this.detalle.set(null);
        this.funcionEnEdicion.set(encontrada);
        this.modoFormulario.set('editar');
      },
      error: (error: HttpErrorResponse) => {
        this.consultando.set(false);
        this.errorOperacion.set(this.describirError(error));
      },
    });
  }

  /** Muestra el detalle de una función mediante GET /api/funciones/{id}. */
  consultar(funcion: FuncionResponse): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(null);
    this.consultando.set(true);
    this.detalle.set(null);

    this.funcionService.consultarPorId(funcion.id).subscribe({
      next: (encontrada) => {
        this.consultando.set(false);
        this.detalle.set(encontrada);
      },
      error: (error: HttpErrorResponse) => {
        this.consultando.set(false);
        this.errorOperacion.set(this.describirError(error));
      },
    });
  }

  /** Envía el formulario como alta (POST) o actualización (PUT). */
  guardar(datos: FuncionRequest): void {
    if (this.guardando()) {
      return;
    }

    const enEdicion = this.modoFormulario() === 'editar' ? this.funcionEnEdicion() : null;

    this.guardando.set(true);
    this.limpiarMensajes();

    const peticion = enEdicion
      ? this.funcionService.actualizar(enEdicion.id, datos)
      : this.funcionService.crear(datos);

    peticion.subscribe({
      next: (guardada) => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.exito.set(
          enEdicion
            ? `La función de «${guardada.tituloPelicula}» se actualizó correctamente.`
            : `La función de «${guardada.tituloPelicula}» se registró correctamente.`,
        );
        this.cargarFunciones(true);
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorOperacion.set(this.describirError(error));
        this.erroresCampo.set(this.extraerErroresCampo(error));
      },
    });
  }

  cancelarFormulario(): void {
    this.cerrarFormulario();
  }

  solicitarEliminacion(funcion: FuncionResponse): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(funcion.id);
  }

  cancelarEliminacion(): void {
    this.idConfirmacion.set(null);
  }

  confirmarEliminacion(funcion: FuncionResponse): void {
    if (this.eliminando()) {
      return;
    }

    this.eliminando.set(true);
    this.errorOperacion.set(null);

    this.funcionService.eliminar(funcion.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.idConfirmacion.set(null);

        if (this.detalle()?.id === funcion.id) {
          this.detalle.set(null);
        }

        if (this.funcionEnEdicion()?.id === funcion.id) {
          this.cerrarFormulario();
        }

        this.exito.set(`La función de «${funcion.tituloPelicula}» se eliminó correctamente.`);
        this.cargarFunciones(true);
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.idConfirmacion.set(null);
        this.errorOperacion.set(this.describirError(error));

        if (error.status === 404) {
          this.cargarFunciones(true);
        }
      },
    });
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
  }

  /** Formatea precio en pesos colombianos. */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(precio);
  }

  /** Carga el listado. Con `silencioso` evita mostrar el indicador de carga. */
  private cargarFunciones(silencioso = false): void {
    if (!silencioso) {
      this.cargando.set(true);
    }

    this.error.set(null);

    this.funcionService.listar().subscribe({
      next: (funciones) => {
        this.funciones.set(funciones);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.describirError(error));
        this.cargando.set(false);
      },
    });
  }

  private cerrarFormulario(): void {
    this.modoFormulario.set(null);
    this.funcionEnEdicion.set(null);
    this.erroresCampo.set(null);
  }

  private limpiarMensajes(): void {
    this.exito.set(null);
    this.errorOperacion.set(null);
    this.erroresCampo.set(null);
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

    const cuerpo = error.error as Partial<ErrorResponse> | null;
    const mensaje = typeof cuerpo?.mensaje === 'string' ? cuerpo.mensaje : null;

    switch (error.status) {
      case 400:
        return mensaje ?? 'Los datos enviados no son válidos. Revise el formulario.';
      case 404:
        return mensaje ?? 'La película o la función solicitada no existe.';
      case 409:
        return (
          mensaje ??
          'No se puede completar la operación por un conflicto de integridad.'
        );
      case 500:
        return 'El servidor no pudo completar la operación. Intente de nuevo más tarde.';
      default:
        return mensaje ?? `No se pudo completar la operación (HTTP ${error.status}).`;
    }
  }
}