/**
 * Contrato de funciones según docs/API_CONTRACT.md (taquilla-cine-api).
 *
 * `fecha` usa el formato YYYY-MM-DD y `hora` el formato HH:mm o HH:mm:ss.
 * `cuposDisponibles` es calculado por el backend y no se envía en las solicitudes.
 */
export interface FuncionRequest {
  peliculaId: number;
  fecha: string;
  hora: string;
  sala: string;
  precio: number;
  cuposTotales: number;
}

export interface FuncionResponse {
  id: number;
  peliculaId: number;
  tituloPelicula: string;
  fecha: string;
  hora: string;
  sala: string;
  precio: number;
  cuposTotales: number;
  cuposDisponibles: number;
}
