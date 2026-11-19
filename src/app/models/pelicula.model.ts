/**
 * Contrato de películas según docs/API_CONTRACT.md (taquilla-cine-api).
 */
export interface PeliculaRequest {
  titulo: string;
  genero: string;
  duracionMin: number;
  clasificacion: string;
}

export interface PeliculaResponse extends PeliculaRequest {
  id: number;
}
