import { Component, Input } from '@angular/core';

/**
 * Encabezado reutilizable de página. Cada vista muestra un único <h1>.
 * La etiqueta superior es opcional y sirve para identificar la sección.
 */
@Component({
  selector: 'app-page-header',
  standalone: false,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input({ required: true }) titulo!: string;
  @Input() descripcion = '';
  @Input() etiqueta = '';
}
