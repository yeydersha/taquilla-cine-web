import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { PeliculaResponse } from '../../../../models';
import { PeliculasModule } from '../../peliculas.module';
import { PeliculaFormComponent } from './pelicula-form.component';

const PELICULA: PeliculaResponse = {
  id: 10,
  titulo: 'Interestelar',
  genero: 'Ciencia ficción',
  duracionMin: 169,
  clasificacion: 'PG-13',
};

describe('PeliculaFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeliculasModule, RouterModule.forRoot([])],
    }).compileComponents();
  });

  function crear() {
    const fixture = TestBed.createComponent(PeliculaFormComponent);
    fixture.detectChanges();
    return {
      fixture,
      comp: fixture.componentInstance,
      el: fixture.nativeElement as HTMLElement,
    };
  }

  function escribir(comp: PeliculaFormComponent, campo: string, valor: unknown): void {
    comp.formulario.get(campo)?.setValue(valor);
  }

  it('muestra el formulario en modo creación con campos vacíos', () => {
    const { el } = crear();

    expect(el.querySelector('h2')?.textContent).toContain('Nueva película');
    expect(el.querySelector('.etiqueta--info')?.textContent?.trim()).toBe('Nueva');
    expect((el.querySelector('#titulo') as HTMLInputElement).value).toBe('');
    expect((el.querySelector('#duracionMin') as HTMLInputElement).value).toBe('');
  });

  it('no envía datos y marca los obligatorios vacíos', () => {
    const { fixture, comp, el } = crear();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(false);
    expect(el.querySelectorAll('.campo__error').length).toBe(4);
    expect(el.textContent).toContain('El título es obligatorio.');
    expect(el.textContent).toContain('La duración es obligatoria.');
  });

  it('rechaza campos compuestos solo por espacios', () => {
    const { fixture, comp, el } = crear();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'titulo', '   ');
    escribir(comp, 'genero', '   ');
    escribir(comp, 'clasificacion', '   ');
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(false);
    expect(el.textContent).toContain('El título no puede contener solo espacios.');
    expect(el.textContent).toContain('El género no puede contener solo espacios.');
  });

  it('valida las longitudes máximas de los campos de texto', () => {
    const { fixture, comp, el } = crear();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'titulo', 'a'.repeat(151));
    escribir(comp, 'genero', 'a'.repeat(81));
    escribir(comp, 'clasificacion', 'a'.repeat(21));
    escribir(comp, 'duracionMin', 120);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(false);
    expect(el.textContent).toContain('El título no puede superar los 150 caracteres.');
    expect(el.textContent).toContain('El género no puede superar los 80 caracteres.');
    expect(el.textContent).toContain('La clasificación no puede superar los 20 caracteres.');
  });

  it('valida la duración como entero mayor que cero', () => {
    const { fixture, comp, el } = crear();
    let emitido = false;
    comp.guardar.subscribe(() => (emitido = true));

    escribir(comp, 'titulo', 'Interestelar');
    escribir(comp, 'genero', 'Ciencia ficción');
    escribir(comp, 'clasificacion', 'PG-13');

    escribir(comp, 'duracionMin', 0);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('La duración debe ser mayor que cero.');

    escribir(comp, 'duracionMin', 12.5);
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(emitido).toBe(false);
    expect(el.textContent).toContain('La duración debe ser un número entero.');
  });

  it('emite los datos recortados al guardar un formulario válido', () => {
    const { fixture, comp, el } = crear();
    let emitido: unknown;
    comp.guardar.subscribe((valor) => (emitido = valor));

    escribir(comp, 'titulo', '  Interestelar  ');
    escribir(comp, 'genero', ' Ciencia ficción ');
    escribir(comp, 'duracionMin', 169);
    escribir(comp, 'clasificacion', ' PG-13 ');
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toEqual({
      titulo: 'Interestelar',
      genero: 'Ciencia ficción',
      duracionMin: 169,
      clasificacion: 'PG-13',
    });
  });

  it('deshabilita los botones mientras se procesa la solicitud', () => {
    const { fixture, el } = crear();

    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();

    expect((el.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
    const cancelar = [...el.querySelectorAll('button')].find((b) =>
      b.textContent?.trim().includes('Cancelar'),
    ) as HTMLButtonElement;
    expect(cancelar.disabled).toBe(true);
  });

  it('carga los datos de la película cuando se va a editar', () => {
    const { fixture, comp, el } = crear();

    fixture.componentRef.setInput('pelicula', PELICULA);
    fixture.detectChanges();

    expect(el.querySelector('h2')?.textContent).toContain('Editar película');
    expect(el.querySelector('.etiqueta--info')?.textContent?.trim()).toBe('ID 10');
    expect(comp.formulario.get('titulo')?.value).toBe('Interestelar');
    expect(comp.formulario.get('duracionMin')?.value).toBe(169);
  });

  it('muestra junto al campo los errores de validación del servidor', () => {
    const { fixture, comp, el } = crear();

    fixture.componentRef.setInput('erroresServidor', { titulo: 'El título ya existe.' });
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.textContent).toContain('El título ya existe.');
  });
});
