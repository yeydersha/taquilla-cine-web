import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  ErrorResponse,
  PeliculaRequest,
  PeliculaResponse,
  ValidationErrorResponse,
} from '../../models';
import { PeliculaService } from '../../services/pelicula.service';

type ModoFormulario = 'crear' | 'editar';

/**
 * Pantalla principal del módulo de películas: listado, consulta, registro,
 * edición y eliminación. El formulario se delega a `PeliculaFormComponent`.
 */
@Component({
  selector: 'app-peliculas',
  standalone: false,
  templateUrl: './peliculas.component.html',
  styleUrl: './peliculas.component.css',
})
export class PeliculasComponent implements OnInit {
  readonly peliculas = signal<PeliculaResponse[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly exito = signal<string | null>(null);
  readonly errorOperacion = signal<string | null>(null);

  readonly modoFormulario = signal<ModoFormulario | null>(null);
  readonly peliculaEnEdicion = signal<PeliculaResponse | null>(null);
  readonly erroresCampo = signal<Record<string, string> | null>(null);
  readonly guardando = signal(false);

  readonly detalle = signal<PeliculaResponse | null>(null);
  readonly consultando = signal(false);

  readonly idConfirmacion = signal<number | null>(null);
  readonly eliminando = signal(false);

  constructor(private readonly peliculaService: PeliculaService) {}

  ngOnInit(): void {
    this.cargarPeliculas();
  }

  /** Abre el formulario vacío para registrar una película. */
  abrirCreacion(): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(null);

    if (this.modoFormulario() === 'crear') {
      return;
    }

    this.detalle.set(null);
    this.peliculaEnEdicion.set(null);
    this.modoFormulario.set('crear');
  }

  /** Consulta la película por ID y carga sus datos en el formulario. */
  editar(pelicula: PeliculaResponse): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(null);
    this.consultando.set(true);

    this.peliculaService.consultarPorId(pelicula.id).subscribe({
      next: (encontrada) => {
        this.consultando.set(false);
        this.detalle.set(null);
        this.peliculaEnEdicion.set(encontrada);
        this.modoFormulario.set('editar');
      },
      error: (error: HttpErrorResponse) => {
        this.consultando.set(false);
        this.errorOperacion.set(this.describirError(error));
      },
    });
  }

  /** Muestra el detalle de una película mediante GET /api/peliculas/{id}. */
  consultar(pelicula: PeliculaResponse): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(null);
    this.consultando.set(true);
    this.detalle.set(null);

    this.peliculaService.consultarPorId(pelicula.id).subscribe({
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
  guardar(datos: PeliculaRequest): void {
    if (this.guardando()) {
      return;
    }

    const enEdicion = this.modoFormulario() === 'editar' ? this.peliculaEnEdicion() : null;

    this.guardando.set(true);
    this.limpiarMensajes();

    const peticion = enEdicion
      ? this.peliculaService.actualizar(enEdicion.id, datos)
      : this.peliculaService.crear(datos);

    peticion.subscribe({
      next: (guardada) => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.exito.set(
          enEdicion
            ? `La película «${guardada.titulo}» se actualizó correctamente.`
            : `La película «${guardada.titulo}» se registró correctamente.`,
        );
        this.cargarPeliculas(true);
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

  solicitarEliminacion(pelicula: PeliculaResponse): void {
    this.limpiarMensajes();
    this.idConfirmacion.set(pelicula.id);
  }

  cancelarEliminacion(): void {
    this.idConfirmacion.set(null);
  }

  confirmarEliminacion(pelicula: PeliculaResponse): void {
    if (this.eliminando()) {
      return;
    }

    this.eliminando.set(true);
    this.errorOperacion.set(null);

    this.peliculaService.eliminar(pelicula.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.idConfirmacion.set(null);

        if (this.detalle()?.id === pelicula.id) {
          this.detalle.set(null);
        }

        if (this.peliculaEnEdicion()?.id === pelicula.id) {
          this.cerrarFormulario();
        }

        this.exito.set(`La película «${pelicula.titulo}» se eliminó correctamente.`);
        this.cargarPeliculas(true);
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.idConfirmacion.set(null);
        this.errorOperacion.set(this.describirError(error));

        if (error.status === 404) {
          this.cargarPeliculas(true);
        }
      },
    });
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
  }

  /** Carga el listado. Con `silencioso` evita mostrar el indicador de carga. */
  private cargarPeliculas(silencioso = false): void {
    if (!silencioso) {
      this.cargando.set(true);
    }

    this.error.set(null);

    this.peliculaService.listar().subscribe({
      next: (peliculas) => {
        this.peliculas.set(peliculas);
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
    this.peliculaEnEdicion.set(null);
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
        return mensaje ?? 'La película solicitada no existe o fue eliminada.';
      case 409:
        return (
          mensaje ??
          'No se puede eliminar la película porque tiene funciones asociadas.'
        );
      case 500:
        return 'El servidor no pudo completar la operación. Intente de nuevo más tarde.';
      default:
        return mensaje ?? `No se pudo completar la operación (HTTP ${error.status}).`;
    }
  }
}
