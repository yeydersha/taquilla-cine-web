/**
 * Contrato del reporte de ventas según docs/API_CONTRACT.md.
 */
export interface DetalleVentaResponse {
  id: number;
  funcionId: number;
  tituloPelicula: string;
  fechaFuncion: string;
  horaFuncion: string;
  sala: string;
  nombreCliente: string;
  cantidadBoletos: number;
  total: number;
  fechaCompra: string;
}

export interface ReporteVentasResponse {
  fechaDesde: string;
  fechaHasta: string;
  cantidadCompras: number;
  totalBoletos: number;
  totalRecaudado: number;
  compras: DetalleVentaResponse[];
}
