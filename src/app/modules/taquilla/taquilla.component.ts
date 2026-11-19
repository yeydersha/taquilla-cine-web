import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import {
  DetalleVentaResponse,
  ReporteVentasResponse,
} from '../../models';
import { ReporteService } from '../../services/reporte.service';

/**
 * Pantalla principal del módulo de taquilla: reporte de ventas con filtros de fecha.
 */
@Component({
  selector: 'app-taquilla',
  standalone: false,
  templateUrl: './taquilla.component.html',
  styleUrl: './taquilla.component.css',
})
export class TaquillaComponent implements OnInit {
  readonly reporte = signal<ReporteVentasResponse | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly fechaHoy = signal<string>('');

  readonly formulario: FormGroup;
  readonly consultando = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly reporteService: ReporteService,
  ) {
    this.formulario = this.fb.group({
      fechaDesde: ['', Validators.required],
      fechaHasta: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.inicializarFechaHoy();
    this.formulario.patchValue({
      fechaDesde: this.fechaHoy(),
      fechaHasta: this.fechaHoy(),
    });
    this.consultar();
  }

  /** Inicializa la fecha de hoy en zona horaria America/Bogota. */
  private inicializarFechaHoy(): void {
    const ahora = new Date();
    // Usar la zona horaria de Colombia (UTC-5)
    const fechaColombia = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const year = fechaColombia.getFullYear();
    const month = String(fechaColombia.getMonth() + 1).padStart(2, '0');
    const day = String(fechaColombia.getDate()).padStart(2, '0');
    this.fechaHoy.set(`${year}-${month}-${day}`);
  }

  /** Establece ambas fechas a hoy y consulta. */
  establecerHoy(): void {
    this.formulario.patchValue({
      fechaDesde: this.fechaHoy(),
      fechaHasta: this.fechaHoy(),
    });
    this.consultar();
  }

  /** Envía la consulta de ventas al backend. */
  consultar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const fechaDesde = this.formulario.value.fechaDesde;
    const fechaHasta = this.formulario.value.fechaHasta;

    if (fechaDesde > fechaHasta) {
      this.error.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    this.consultando.set(true);
    this.error.set(null);
    this.reporte.set(null);

    this.reporteService.consultarVentas(fechaDesde, fechaHasta).subscribe({
      next: (reporte) => {
        this.consultando.set(false);
        this.reporte.set(reporte);
      },
      error: (error: HttpErrorResponse) => {
        this.consultando.set(false);
        this.error.set(this.describirError(error));
      },
    });
  }

  /** Formatea un precio en pesos colombianos. */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(precio);
  }

  /** Formatea una fecha de compra (ISO con offset) para visualización en zona horaria local. */
  formatearFechaCompra(fecha: string): string {
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

  /** Formatea una fecha simple (YYYY-MM-DD) para visualización. */
  formatearFechaSimple(fecha: string): string {
    try {
      const partes = fecha.split('-');
      if (partes.length !== 3) return fecha;
      const dt = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
      }).format(dt);
    } catch {
      return fecha;
    }
  }

  /** Formatea una hora simple (HH:mm:ss) para visualización. */
  formatearHoraSimple(hora: string): string {
    try {
      const partes = hora.split(':');
      if (partes.length < 2) return hora;
      return `${partes[0]}:${partes[1]}`;
    } catch {
      return hora;
    }
  }

  /** Obtiene el mensaje de error para un campo del formulario. */
  errorDe(campo: 'fechaDesde' | 'fechaHasta'): string | null {
    const control = this.formulario.get(campo);
    if (!control || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'La fecha es obligatoria.';
    }
    return null;
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
        return mensaje ?? 'Los parámetros de la consulta no son válidos.';
      case 500:
        return 'El servidor no pudo completar la operación. Intente de nuevo más tarde.';
      default:
        return mensaje ?? `No se pudo completar la operación (HTTP ${error.status}).`;
    }
  }
}