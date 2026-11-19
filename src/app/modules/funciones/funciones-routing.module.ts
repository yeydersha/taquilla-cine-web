import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuncionesComponent } from './funciones.component';

const routes: Routes = [
  { path: '', component: FuncionesComponent, title: 'Funciones | Taquilla de Cine' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FuncionesRoutingModule {}
