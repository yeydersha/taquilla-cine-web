import { Component } from '@angular/core';

/**
 * Contenedor principal: marca, navegación y <router-outlet>.
 * No contiene lógica de negocio.
 */
@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly anioActual = new Date().getFullYear();
}
