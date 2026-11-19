import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('debe crear el componente principal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe mostrar los cuatro enlaces de navegación y el contenido principal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const enlaces = compiled.querySelectorAll('.navegacion a');

    expect(enlaces.length).toBe(4);
    expect(compiled.querySelector('main#contenido')).toBeTruthy();
    expect(compiled.textContent).toContain('Películas');
    expect(compiled.textContent).toContain('Funciones');
    expect(compiled.textContent).toContain('Compras');
    expect(compiled.textContent).toContain('Taquilla');
  });
});
