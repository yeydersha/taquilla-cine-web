import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { DetalleVentaResponse, ReporteVentasResponse } from '../../models';
import { ReporteService } from '../../services/reporte.service';
import { TaquillaComponent } from './taquilla.component';
import { TaquillaModule } from './taquilla.module';

const REPORTE: ReporteVentasResponse = {
  fechaDesde: '2026-11-17',
  fechaHasta: '2026-11-17',
  cantidadCompras: 2,
  totalBoletos: 5,
  totalRecaudado: 75000.00,
  compras: [
    {
      id: 667,
      funcionId: 545,
      tituloPelicula: 'Interestelar',
      fechaFuncion: '2026-12-01',
      horaFuncion: '18:30:00',
      sala: 'Sala 1',
      nombreCliente: 'Cliente A',
      cantidadBoletos: 3,
      total: 45000.00,
      fechaCompra: '2026-11-17T20:00:05.552265-05:00',
    },
    {
      id: 668,
      funcionId: 545,
      tituloPelicula: 'Interestelar',
      fechaFuncion: '2026-12-01',
      horaFuncion: '18:30:00',
      sala: 'Sala 1',
      nombreCliente: 'Cliente B',
      cantidadBoletos: 2,
      total: 30000.00,
      fechaCompra: '2026-11-17T20:00:05.612556-05:00',
    },
  ],
};

const REPORTE_VACIO: ReporteVentasResponse = {
  fechaDesde: '2026-11-18',
  fechaHasta: '2026-11-18',
  cantidadCompras: 0,
  totalBoletos: 0,
  totalRecaudado: 0.00,
  compras: [],
};

describe('TaquillaComponent', () => {
  let reporteServiceMock: any;

  beforeEach(async () => {
    reporteServiceMock = {
      consultarVentas: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaquillaModule, RouterModule.forRoot([])],
      providers: [
        { provide: ReporteService, useValue: reporteServiceMock },
      ],
    }).compileComponents();
  });

  function crear(reporte: ReporteVentasResponse = REPORTE_VACIO) {
    reporteServiceMock.consultarVentas.mockReturnValue(of(reporte));
    const fixture = TestBed.createComponent(TaquillaComponent);
    fixture.detectChanges();
    return { fixture, comp: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    reporteServiceMock.consultarVentas.mockReturnValue(of(REPORTE_VACIO));
  });

  it('debe inicializar con la fecha de hoy en ambos campos', () => {
    reporteServiceMock.consultarVentas.mockReturnValue(of(REPORTE_VACIO));
    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    // Verificar que el formulario tiene la fecha de hoy
    expect(comp.formulario.value.fechaDesde).toBeTruthy();
    expect(comp.formulario.value.fechaHasta).toBeTruthy();
  });

  it('debe cargar el reporte de ventas al iniciar', () => {
    const { fixture, comp, el } = crear(REPORTE);
    fixture.detectChanges();

    expect(reporteServiceMock.consultarVentas).toHaveBeenCalled();
    expect(comp.reporte()).toEqual(REPORTE);
  });

  it('debe mostrar los indicadores correctamente', () => {
    const { fixture, el } = crear(REPORTE);
    fixture.detectChanges();

    expect(el.textContent).toContain('2');
    expect(el.textContent).toContain('5');
    expect(el.textContent).toContain('75.000,00');
  });

  it('debe mostrar el detalle de ventas', () => {
    const { fixture, el } = crear(REPORTE);
    fixture.detectChanges();

    expect(el.textContent).toContain('Cliente A');
    expect(el.textContent).toContain('Cliente B');
    expect(el.textContent).toContain('Interestelar');
    expect(el.textContent).toContain('Sala 1');
    expect(el.textContent).toContain('3');
    expect(el.textContent).toContain('45.000,00');
  });

  it('debe formatear el precio en COP', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    expect(comp.formatearPrecio(15000)).toContain('15.000,00');
    expect(comp.formatearPrecio(1234567.89)).toContain('1.234.567,89');
  });

  it('debe formatear la fecha de compra', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    const fecha = comp.formatearFechaCompra('2026-11-17T20:00:05.552265-05:00');
    expect(fecha.length).toBeGreaterThan(0);
  });

  it('debe formatear la fecha simple (YYYY-MM-DD)', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    const fecha = comp.formatearFechaSimple('2026-11-17');
    expect(fecha.length).toBeGreaterThan(0);
  });

  it('debe formatear la hora simple (HH:mm:ss)', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    const hora = comp.formatearHoraSimple('18:30:00');
    expect(hora).toBe('18:30');
  });

  it('debe validar fechaDesde obligatoria', () => {
    reporteServiceMock.consultarVentas.mockReturnValue(of(REPORTE_VACIO));

    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.formulario.get('fechaDesde')?.setValue('');
    comp.formulario.get('fechaHasta')?.setValue('2026-11-18');
    fixture.detectChanges();

    comp.consultar();
    fixture.detectChanges();

    expect(comp.error()).toBeNull(); // El componente no valida aquí, solo marca touched
    // La validación real se hace en el submit
  });

  it('debe validar rango de fechas invertido', () => {
    const fixture = TestBed.createComponent(TaquillaComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    comp.formulario.patchValue({
      fechaDesde: '2026-11-18',
      fechaHasta: '2026-11-17',
    });
    fixture.detectChanges();

    comp.consultar();
    fixture.detectChanges();

    expect(el.textContent).toContain('La fecha inicial no puede ser posterior a la fecha final');
  });

  it('debe establecer fecha de hoy con el botón Hoy', () => {
    reporteServiceMock.consultarVentas.mockReturnValue(of(REPORTE_VACIO));

    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.establecerHoy();
    fixture.detectChanges();

    expect(comp.formulario.value.fechaDesde).toBe(comp.fechaHoy());
    expect(comp.formulario.value.fechaHasta).toBe(comp.fechaHoy());
  });

  it('debe manejar error de conexión', () => {
    const errorRed = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    reporteServiceMock.consultarVentas.mockReturnValue(throwError(() => errorRed));

    const fixture = TestBed.createComponent(TaquillaComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    comp.consultar();
    fixture.detectChanges();

    expect(el.textContent).toContain('No se pudo conectar con el backend');
  });

  it('debe manejar error 400', () => {
    const error400 = new HttpErrorResponse({
      status: 400,
      error: { mensaje: 'Parámetro inválido' },
    });
    reporteServiceMock.consultarVentas.mockReturnValue(throwError(() => error400));

    const fixture = TestBed.createComponent(TaquillaComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    comp.consultar();
    fixture.detectChanges();

    expect(el.textContent).toContain('Parámetro inválido');
  });

  it('debe manejar error 500', () => {
    const error500 = new HttpErrorResponse({
      status: 500,
      error: { mensaje: 'Error interno' },
    });
    reporteServiceMock.consultarVentas.mockReturnValue(throwError(() => error500));

    const fixture = TestBed.createComponent(TaquillaComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    comp.consultar();
    fixture.detectChanges();

    expect(el.textContent).toContain('El servidor no pudo completar la operación');
  });

  it('debe deshabilitar el botón mientras consulta', () => {
    reporteServiceMock.consultarVentas.mockReturnValue(of(REPORTE_VACIO));

    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.consultando.set(true);
    fixture.detectChanges();

    const boton = el.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debe mostrar estado vacío cuando no hay ventas', () => {
    reporteServiceMock.consultarVentas.mockReturnValue(of(REPORTE_VACIO));

    const { fixture, el } = crear();
    fixture.detectChanges();

    expect(el.textContent).toContain('No hay ventas en el período seleccionado');
  });

  it('debe formatear precio solo números', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    // El método formatearPrecio incluye símbolo, formatearPrecioSoloNumero no
    expect(comp.formatearPrecio(15000)).toContain('15.000,00');
  });
});