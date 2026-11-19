import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { FuncionResponse, PeliculaResponse } from '../../../../models';
import { FuncionesModule } from '../../funciones.module';
import { FuncionFormComponent } from './funcion-form.component';

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

describe('FuncionFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionesModule, RouterModule.forRoot([])],
    }).compileComponents();
  });

  function crear() {
    const fixture = TestBed.createComponent(FuncionFormComponent);
    fixture.detectChanges();
    return {
      fixture,
      comp: fixture.componentInstance,
      el: fixture.nativeElement as HTMLElement,
    };
  }

  function escribir(comp: FuncionFormComponent, campo: string, valor: unknown): void {
    comp.formulario.get(campo)?.setValue(valor);
  }

  function setPeliculas(comp: FuncionFormComponent, peliculas: PeliculaResponse[]): void {
    comp.peliculas = peliculas;
    comp.ngOnChanges({ peliculas: { currentValue: peliculas, previousValue: [], firstChange: true, isFirstChange: () => true } });
  }

  it('muestra el formulario en modo creación con campos vacíos', () => {
    const { fixture, el } = crear();

    expect(el.querySelector('h2')?.textContent).toContain('Nueva función');
    expect(el.querySelector('.etiqueta--info')?.textContent?.trim()).toBe('Nueva');
    expect((el.querySelector('#fecha') as HTMLInputElement).value).toBe('');
    expect((el.querySelector('#hora') as HTMLInputElement).value).toBe('');
  });

  it('informa cuando no hay películas disponibles', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, []);
    fixture.detectChanges();

    expect(el.textContent).toContain('No hay películas registradas');
    expect(el.textContent).toContain('Primero debe crear una en el módulo de Películas');
  });

  it('no envía datos y marca los obligatorios vacíos', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(false);
    expect(el.querySelectorAll('.campo__error').length).toBe(6);
    expect(el.textContent).toContain('Debe seleccionar una película.');
    expect(el.textContent).toContain('La fecha es obligatoria.');
    expect(el.textContent).toContain('La hora es obligatoria.');
    expect(el.textContent).toContain('La sala es obligatoria.');
    expect(el.textContent).toContain('El precio es obligatorio.');
    expect(el.textContent).toContain('Los cupos totales son obligatorios.');
  });

  it('rechaza sala compuesta solo por espacios', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '18:30');
    escribir(comp, 'sala', '   ');
    escribir(comp, 'precio', 15000);
    escribir(comp, 'cuposTotales', 100);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(false);
    expect(el.textContent).toContain('La sala no puede contener solo espacios.');
  });

  it('valida la longitud máxima de la sala', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '18:30');
    escribir(comp, 'sala', 'a'.repeat(51));
    escribir(comp, 'precio', 15000);
    escribir(comp, 'cuposTotales', 100);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(false);
    expect(el.textContent).toContain('La sala no puede superar los 50 caracteres.');
  });

  it('valida el precio como número positivo con dos decimales', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '18:30');
    escribir(comp, 'sala', 'Sala 1');
    escribir(comp, 'cuposTotales', 100);

    escribir(comp, 'precio', 0);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('El precio debe ser mayor que cero.');

    escribir(comp, 'precio', -100);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('El precio debe ser mayor que cero.');

    escribir(comp, 'precio', 15000.123);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('El precio debe ser un número positivo con hasta dos decimales.');
  });

  it('valida los cupos totales como entero mayor que cero', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '18:30');
    escribir(comp, 'sala', 'Sala 1');
    escribir(comp, 'precio', 15000);

    escribir(comp, 'cuposTotales', 0);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('Los cupos totales deben ser mayores que cero.');

    escribir(comp, 'cuposTotales', 12.5);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('Los cupos totales deben ser un número entero mayor que cero.');
  });

  it('valida formatos de fecha y hora', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'sala', 'Sala 1');
    escribir(comp, 'precio', 15000);
    escribir(comp, 'cuposTotales', 100);

    escribir(comp, 'fecha', '01-12-2026');
    escribir(comp, 'hora', '18:30');
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('La fecha no tiene un formato válido');

    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '25:00');
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('La hora no tiene un formato válido');
  });

  it('emite los datos recortados al guardar un formulario válido', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido: unknown;
    comp.guardar.subscribe((valor) => (emitido = valor));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '18:30');
    escribir(comp, 'sala', '  Sala 1  ');
    escribir(comp, 'precio', 15000.5);
    escribir(comp, 'cuposTotales', 100);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toEqual({
      peliculaId: 10,
      fecha: '2026-12-01',
      hora: '18:30',
      sala: 'Sala 1',
      precio: 15000.5,
      cuposTotales: 100,
    });
  });

  it('deshabilita los botones mientras se procesa la solicitud', () => {
    const { fixture, el } = crear();
    setPeliculas(fixture.componentInstance, [PELICULA]);
    fixture.detectChanges();

    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();

    expect((el.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
    const cancelar = [...el.querySelectorAll('button')].find((b) =>
      b.textContent?.trim().includes('Cancelar'),
    ) as HTMLButtonElement;
    expect(cancelar.disabled).toBe(true);
  });

  it('carga los datos de la función cuando se va a editar', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.componentRef.setInput('funcion', FUNCION);
    fixture.detectChanges();

    expect(el.querySelector('h2')?.textContent).toContain('Editar función');
    expect(el.querySelector('.etiqueta--info')?.textContent?.trim()).toBe('ID 20');
    expect(comp.formulario.get('peliculaId')?.value).toBe(10);
    expect(comp.formulario.get('fecha')?.value).toBe('2026-12-01');
    expect(comp.formulario.get('hora')?.value).toBe('18:30');
    expect(comp.formulario.get('sala')?.value).toBe('Sala 1');
    expect(comp.formulario.get('precio')?.value).toBe(15000);
    expect(comp.formulario.get('cuposTotales')?.value).toBe(100);
  });

  it('muestra información de cupos en modo edición', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.componentRef.setInput('funcion', FUNCION);
    fixture.detectChanges();

    expect(el.textContent).toContain('Cupos totales actuales');
    expect(el.textContent).toContain('100');
    expect(el.textContent).toContain('Cupos disponibles');
    expect(el.textContent).toContain('90');
    expect(el.textContent).toContain('Boletos vendidos');
    expect(el.textContent).toContain('10');
  });

  it('muestra junto al campo los errores de validación del servidor', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();

    fixture.componentRef.setInput('erroresServidor', { sala: 'La sala ya está ocupada en ese horario.' });
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.textContent).toContain('La sala ya está ocupada en ese horario.');
  });

  it('no envía cuposDisponibles como dato editable', () => {
    const { fixture, comp, el } = crear();
    setPeliculas(comp, [PELICULA]);
    fixture.detectChanges();
    let emitido: unknown;
    comp.guardar.subscribe((valor) => (emitido = valor));

    escribir(comp, 'peliculaId', 10);
    escribir(comp, 'fecha', '2026-12-01');
    escribir(comp, 'hora', '18:30');
    escribir(comp, 'sala', 'Sala 1');
    escribir(comp, 'precio', 15000);
    escribir(comp, 'cuposTotales', 100);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const datosEmitidos = emitido as Record<string, unknown>;
    expect(datosEmitidos).not.toHaveProperty('cuposDisponibles');
  });
});