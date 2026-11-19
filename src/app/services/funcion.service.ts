import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FuncionRequest, FuncionResponse } from '../models';

/**
 * Servicio HTTP del módulo de funciones.
 *
 * La URL base se toma de `environment.apiUrl`; no se repite en los componentes.
 * Implementa el CRUD completo definido en el contrato de la API.
 */
@Injectable({ providedIn: 'root' })
export class FuncionService {
  private readonly recurso = `${environment.apiUrl}/funciones`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<FuncionResponse[]> {
    return this.http.get<FuncionResponse[]>(this.recurso);
  }

  consultarPorId(id: number): Observable<FuncionResponse> {
    return this.http.get<FuncionResponse>(`${this.recurso}/${id}`);
  }

  crear(datos: FuncionRequest): Observable<FuncionResponse> {
    return this.http.post<FuncionResponse>(this.recurso, datos);
  }

  actualizar(id: number, datos: FuncionRequest): Observable<FuncionResponse> {
    return this.http.put<FuncionResponse>(`${this.recurso}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.recurso}/${id}`);
  }
}