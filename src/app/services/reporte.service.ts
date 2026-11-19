import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ReporteVentasResponse } from '../models';

/**
 * Servicio HTTP del módulo de taquilla/reportes.
 *
 * La URL base se toma de `environment.apiUrl`; no se repite en los componentes.
 * Implementa la consulta de ventas según el contrato de la API.
 */
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly recurso = `${environment.apiUrl}/reportes`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Consulta el reporte de ventas por rango de fechas.
   *
   * @param fechaDesde Fecha inicial en formato YYYY-MM-DD.
   * @param fechaHasta Fecha final en formato YYYY-MM-DD.
   * @returns Observable con el reporte de ventas.
   */
  consultarVentas(fechaDesde: string, fechaHasta: string): Observable<ReporteVentasResponse> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);

    return this.http.get<ReporteVentasResponse>(`${this.recurso}/ventas`, { params });
  }
}