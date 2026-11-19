/**
 * Formato global de error del backend (API_CONTRACT.md, sección 8).
 * `ValidationErrorResponse` añade el mapa de errores de Bean Validation.
 */
export interface ErrorResponse {
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  timestamp: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  errores: Record<string, string>;
}
