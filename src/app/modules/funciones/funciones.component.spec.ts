import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { FuncionRequest, FuncionResponse, PeliculaResponse } from '../../models';
import { FuncionService } from '../../services/funcion.service';
import { PeliculaService } from '../../services/pelicula.service';
import { FuncionesComponent } from './funciones.component';
import { FuncionesModule } from './funciones.module';

const PELICULA: PeliculaResponse = {
  id: 10,
  titulo: 'Interestelar',
  genero: 'Ciencia ficción',
  duracionMin: 169,
  clasificacion: 'PG-13',
};

const FUNCION: FuncionResponse = {
  id: 20,
  peliculaId: 10,
  tituloPelicula: 'Interestelar',
  fecha: '2026-12-01',
  hora: '18:30:00',
  sala: 'Sala 1',
  precio: 15000,
  cuposTotales: 100,
  cuposDisponibles: 90,
};

const FUNCION_SIN_COMPRAS: FuncionResponse = {
  id: 21,
  peliculaId: 10,
  tituloPelicula: 'Interestelar',
  fecha: '2026-12-02',
  hora: '20:00:00',
  sala: 'Sala 2',
  precio: 15000,
  cuposTotales: 80,
  cuposDisponibles: 80,
};

describe('FuncionesComponent', () => {
  let funcionServiceMock: any;
  let peliculaServiceMock: any;

  beforeEach(async () => {
    funcionServiceMock = {
      listar: vi.fn(),
      consultarPorId: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn(),
    };

    peliculaServiceMock = {
      listar: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FuncionesModule, RouterModule.forRoot([])],
      providers: [
        { provide: FuncionService, useValue: funcionServiceMock },
        { provide: PeliculaService, useValue: peliculaServiceMock },
      ],
    }).compileComponents();
  });

  function crear() {
    const fixture = TestBed.createComponent(FuncionesComponent);
    fixture.detectChanges();
    return { fixture, comp: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  function setListarPeliculas(peliculas: PeliculaResponse[] = [PELICULA]) {
    peliculaServiceMock.listar.mockReturnValue(of(peliculas));
  }

  function setListarFunciones(funciones: FuncionResponse[] = [FUNCION]) {
    funcionServiceMock.listar.mockReturnValue(of(funciones));
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setListarPeliculas();
    setListarFunciones();
  });

  it('debe listar las funciones correctamente', () => {
    const { fixture, el } = crear();
    fixture.detectChanges();

    expect(el.textContent).toContain('Interestelar');
    expect(el.textContent).toContain('2026-12-01');
    expect(el.textContent).toContain('18:30:00');
    expect(el.textContent).toContain('Sala 1');
    expect(el.textContent).toContain('15.000,00');
    expect(el.textContent).toContain('100');
    expect(el.textContent).toContain('90');
  });

  it('debe cargar las películas para el selector', () => {
    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.abrirCreacion();
    fixture.detectChanges();

    expect(el.querySelector('select')?.options.length).toBeGreaterThan(1);
    expect(el.textContent).toContain('Interestelar');
  });

  it('informa cuando no existen películas', () => {
    peliculaServiceMock.listar.mockReturnValue(of([]));
    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.abrirCreacion();
    fixture.detectChanges();

    expect(el.textContent).toContain('No hay películas registradas');
    expect(el.textContent).toContain('módulo de Películas');
  });

  it('debe registrar una función exitosamente', () => {
    const nuevaFuncion: FuncionResponse = {
      ...FUNCION,
      id: 22,
      fecha: '2026-12-05',
      hora: '15:00:00',
      sala: 'Sala 3',
    };
    funcionServiceMock.crear.mockReturnValue(of(nuevaFuncion));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.abrirCreacion();
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 10,
      fecha: '2026-12-05',
      hora: '15:00',
      sala: 'Sala 3',
      precio: 15000,
      cuposTotales: 100,
    });
    fixture.detectChanges();

    expect(funcionServiceMock.crear).toHaveBeenCalled();
    expect(comp.exito()).toContain('se registró correctamente');
  });

  it('debe cargar datos en el formulario al editar', () => {
    funcionServiceMock.consultarPorId.mockReturnValue(of(FUNCION));

    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.editar(FUNCION);
    fixture.detectChanges();

    expect(comp.modoFormulario()).toBe('editar');
    expect(comp.funcionEnEdicion()).toEqual(FUNCION);
    expect(el.querySelector('h2')?.textContent).toContain('Editar función');
  });

  it('debe actualizar una función exitosamente', () => {
    const actualizada: FuncionResponse = { ...FUNCION, cuposTotales: 120, cuposDisponibles: 110 };
    funcionServiceMock.consultarPorId.mockReturnValue(of(FUNCION));
    funcionServiceMock.actualizar.mockReturnValue(of(actualizada));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.editar(FUNCION);
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 10,
      fecha: '2026-12-01',
      hora: '18:30',
      sala: 'Sala 1',
      precio: 15000,
      cuposTotales: 120,
    });
    fixture.detectChanges();

    expect(funcionServiceMock.actualizar).toHaveBeenCalledWith(FUNCION.id, expect.any(Object));
    expect(comp.exito()).toContain('se actualizó correctamente');
  });

  it('cancela el formulario sin enviar solicitud', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.abrirCreacion();
    fixture.detectChanges();

    comp.cancelarFormulario();
    fixture.detectChanges();

    expect(comp.modoFormulario()).toBeNull();
    expect(funcionServiceMock.crear).not.toHaveBeenCalled();
  });

  it('solicita confirmación antes de eliminar', () => {
    const { fixture, comp, el } = crear();
    fixture.detectChanges();

    comp.solicitarEliminacion(FUNCION);
    fixture.detectChanges();

    expect(comp.idConfirmacion()).toBe(FUNCION.id);
    expect(el.textContent).toContain('¿Eliminar la función de');
  });

  it('cancela la eliminación sin enviar DELETE', () => {
    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.solicitarEliminacion(FUNCION);
    fixture.detectChanges();

    comp.cancelarEliminacion();
    fixture.detectChanges();

    expect(comp.idConfirmacion()).toBeNull();
    expect(funcionServiceMock.eliminar).not.toHaveBeenCalled();
  });

  it('debe eliminar una función después de confirmar', () => {
    funcionServiceMock.eliminar.mockReturnValue(of(undefined));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.solicitarEliminacion(FUNCION);
    fixture.detectChanges();
    comp.confirmarEliminacion(FUNCION);
    fixture.detectChanges();

    expect(funcionServiceMock.eliminar).toHaveBeenCalledWith(FUNCION.id);
    expect(comp.exito()).toBeTruthy();
  });

  it('debe manejar error 409 al eliminar función con compras', () => {
    const error409 = new HttpErrorResponse({
      status: 409,
      error: { mensaje: 'No se puede eliminar la función porque tiene compras asociadas' },
    });
    funcionServiceMock.eliminar.mockReturnValue(throwError(() => error409));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.confirmarEliminacion(FUNCION);
    fixture.detectChanges();

    expect(comp.errorOperacion()).toBe('No se puede eliminar la función porque tiene compras asociadas');
    expect(comp.funciones()).toContain(FUNCION);
  });

  it('debe manejar error 409 al reducir capacidad por debajo de boletos vendidos', () => {
    const error409 = new HttpErrorResponse({
      status: 409,
      error: { mensaje: 'No se puede reducir la capacidad por debajo de los boletos vendidos' },
    });
    funcionServiceMock.consultarPorId.mockReturnValue(of(FUNCION));
    funcionServiceMock.actualizar.mockReturnValue(throwError(() => error409));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.editar(FUNCION);
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 10,
      fecha: '2026-12-01',
      hora: '18:30',
      sala: 'Sala 1',
      precio: 15000,
      cuposTotales: 50,
    });
    fixture.detectChanges();

    expect(comp.errorOperacion()).toBe('No se puede reducir la capacidad por debajo de los boletos vendidos');
  });

  it('debe manejar error 409 al cambiar película de función con compras', () => {
    const error409 = new HttpErrorResponse({
      status: 409,
      error: { mensaje: 'No se puede cambiar la película de una función con compras' },
    });
    funcionServiceMock.consultarPorId.mockReturnValue(of(FUNCION));
    funcionServiceMock.actualizar.mockReturnValue(throwError(() => error409));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.editar(FUNCION);
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 999,
      fecha: '2026-12-01',
      hora: '18:30',
      sala: 'Sala 1',
      precio: 15000,
      cuposTotales: 100,
    });
    fixture.detectChanges();

    expect(comp.errorOperacion()).toBe('No se puede cambiar la película de una función con compras');
  });

  it('debe manejar error de conexión', () => {
    const errorRed = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    funcionServiceMock.listar.mockReturnValue(throwError(() => errorRed));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    expect(comp.error()).toContain('No se pudo conectar con el backend');
  });

  it('actualiza el listado después de crear una función', () => {
    const nuevaFuncion: FuncionResponse = { ...FUNCION, id: 22, fecha: '2026-12-05' };
    funcionServiceMock.crear.mockReturnValue(of(nuevaFuncion));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.abrirCreacion();
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 10,
      fecha: '2026-12-05',
      hora: '15:00',
      sala: 'Sala 3',
      precio: 15000,
      cuposTotales: 100,
    });
    fixture.detectChanges();

    expect(funcionServiceMock.listar).toHaveBeenCalledTimes(2);
  });

  it('actualiza el listado después de editar una función', () => {
    const actualizada: FuncionResponse = { ...FUNCION, cuposTotales: 120 };
    funcionServiceMock.consultarPorId.mockReturnValue(of(FUNCION));
    funcionServiceMock.actualizar.mockReturnValue(of(actualizada));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.editar(FUNCION);
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 10,
      fecha: '2026-12-01',
      hora: '18:30',
      sala: 'Sala 1',
      precio: 15000,
      cuposTotales: 120,
    });
    fixture.detectChanges();

    expect(funcionServiceMock.listar).toHaveBeenCalledTimes(2);
  });

  it('actualiza el listado después de eliminar una función', () => {
    funcionServiceMock.eliminar.mockReturnValue(of(undefined));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.solicitarEliminacion(FUNCION);
    fixture.detectChanges();
    comp.confirmarEliminacion(FUNCION);
    fixture.detectChanges();

    expect(funcionServiceMock.listar).toHaveBeenCalledTimes(2);
  });

  it('no envía cuposDisponibles como dato editable', () => {
    const nuevaFuncion: FuncionResponse = { ...FUNCION, id: 22 };
    funcionServiceMock.crear.mockReturnValue(of(nuevaFuncion));

    const { fixture, comp } = crear();
    fixture.detectChanges();

    comp.abrirCreacion();
    fixture.detectChanges();

    comp.guardar({
      peliculaId: 10,
      fecha: '2026-12-05',
      hora: '15:00',
      sala: 'Sala 3',
      precio: 15000,
      cuposTotales: 100,
    });
    fixture.detectChanges();

    const llamada = funcionServiceMock.crear.mock.calls[0];
    const datosEnviados = llamada[0] as FuncionRequest;
    expect(datosEnviados).not.toHaveProperty('cuposDisponibles');
  });
});