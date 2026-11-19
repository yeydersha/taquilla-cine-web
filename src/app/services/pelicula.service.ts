import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PeliculaRequest, PeliculaResponse } from '../models';

/**
 * Servicio HTTP del módulo de películas.
 *
 * La URL base se toma de `environment.apiUrl`; no se repite en los componentes.
 * Implementa el CRUD completo definido en el contrato de la API.
 */
@Injectable({ providedIn: 'root' })
export class PeliculaService {
  private readonly recurso = `${environment.apiUrl}/peliculas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<PeliculaResponse[]> {
    return this.http.get<PeliculaResponse[]>(this.recurso);
  }

  consultarPorId(id: number): Observable<PeliculaResponse> {
    return this.http.get<PeliculaResponse>(`${this.recurso}/${id}`);
  }

  crear(datos: PeliculaRequest): Observable<PeliculaResponse> {
    return this.http.post<PeliculaResponse>(this.recurso, datos);
  }

  actualizar(id: number, datos: PeliculaRequest): Observable<PeliculaResponse> {
    return this.http.put<PeliculaResponse>(`${this.recurso}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.recurso}/${id}`);
  }
}
