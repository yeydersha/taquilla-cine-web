import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PageHeaderComponent } from './components/page-header/page-header.component';

/**
 * Componentes reutilizables y directivas comunes para todos los módulos.
 */
@NgModule({
  declarations: [PageHeaderComponent],
  imports: [CommonModule],
  exports: [CommonModule, PageHeaderComponent],
})
export class SharedModule {}
