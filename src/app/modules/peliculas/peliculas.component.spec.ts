import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { PeliculaRequest, PeliculaResponse } from '../../models';
import { PeliculaService } from '../../services/pelicula.service';
import { PeliculasComponent } from './peliculas.component';
import { PeliculasModule } from './peliculas.module';

const PELICULA: PeliculaResponse = {
  id: 1,
  titulo: 'Interestelar',
  genero: 'Ciencia ficción',
  duracionMin: 169,
  clasificacion: 'PG-13',
};

describe('PeliculasComponent', () => {
  let servicioMock: any;

  beforeEach(async () => {
    servicioMock = {
      listar: vi.fn(),
      consultarPorId: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PeliculasModule, RouterModule.forRoot([])],
      providers: [{ provide: PeliculaService, useValue: servicioMock }],
    }).compileComponents();
  });

  function crear() {
    const fixture = TestBed.createComponent(PeliculasComponent);
    fixture.detectChanges();
    return { fixture, comp: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('debe listar las películas correctamente', () => {
    servicioMock.listar.mockReturnValue(of([PELICULA]));
    const { fixture, el } = crear();
    fixture.detectChanges();

    expect(el.textContent).toContain('Interestelar');
    expect(el.textContent).toContain('169 min');
  });

  it('debe registrar una película exitosamente', () => {
    servicioMock.listar.mockReturnValue(of([]));
    servicioMock.crear.mockReturnValue(of({ ...PELICULA, id: 2, titulo: 'Dune' }));
    const { fixture, comp, el } = crear();

    comp.guardar({ titulo: 'Dune', genero: 'Ciencia ficción', duracionMin: 155, clasificacion: 'PG-13' });
    fixture.detectChanges();

    expect(servicioMock.crear).toHaveBeenCalled();
    expect(comp.exito()).toContain('Dune');
  });

  it('debe cargar datos en el formulario al editar', () => {
    servicioMock.listar.mockReturnValue(of([PELICULA]));
    servicioMock.consultarPorId.mockReturnValue(of(PELICULA));
    const { fixture, comp, el } = crear();

    comp.editar(PELICULA);
    fixture.detectChanges();

    expect(comp.modoFormulario()).toBe('editar');
    expect(comp.peliculaEnEdicion()).toEqual(PELICULA);
  });

  it('debe eliminar una película después de confirmar', () => {
    servicioMock.listar.mockReturnValue(of([PELICULA]));
    servicioMock.eliminar.mockReturnValue(of(undefined));
    const { fixture, comp, el } = crear();

    comp.solicitarEliminacion(PELICULA);
    fixture.detectChanges();
    comp.confirmarEliminacion(PELICULA);
    fixture.detectChanges();

    expect(servicioMock.eliminar).toHaveBeenCalledWith(PELICULA.id);
    expect(comp.exito()).toBeTruthy();
  });

  it('debe manejar error 409 al eliminar', () => {
    servicioMock.listar.mockReturnValue(of([PELICULA]));
    servicioMock.eliminar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { mensaje: 'Conflicto' } })));
    const { fixture, comp, el } = crear();

    comp.confirmarEliminacion(PELICULA);
    fixture.detectChanges();

    expect(comp.errorOperacion()).toBe('Conflicto');
  });
});
