import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ComprasComponent } from './compras.component';

const routes: Routes = [
  { path: '', component: ComprasComponent, title: 'Compras | Taquilla de Cine' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComprasRoutingModule {}
