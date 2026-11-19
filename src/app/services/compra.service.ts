import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CompraRequest, CompraResponse } from '../models';

/**
 * Servicio HTTP del módulo de compras.
 *
 * La URL base se toma de `environment.apiUrl`; no se repite en los componentes.
 * Implementa las operaciones definidas en el contrato de la API (GET y POST).
 */
@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly recurso = `${environment.apiUrl}/compras`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<CompraResponse[]> {
    return this.http.get<CompraResponse[]>(this.recurso);
  }

  crear(datos: CompraRequest): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(this.recurso, datos);
  }
}