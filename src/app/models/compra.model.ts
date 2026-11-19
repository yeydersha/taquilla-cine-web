/**
 * Contrato de compras según docs/API_CONTRACT.md (taquilla-cine-api).
 *
 * El backend calcula `total` y `fechaCompra`; el cliente solo envía
 * `funcionId`, `nombreCliente` y `cantidadBoletos`.
 */
export interface CompraRequest {
  funcionId: number;
  nombreCliente: string;
  cantidadBoletos: number;
}

export interface CompraResponse {
  id: number;
  funcionId: number;
  nombreCliente: string;
  cantidadBoletos: number;
  total: number;
  fechaCompra: string;
}
