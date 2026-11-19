import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TaquillaComponent } from './taquilla.component';

const routes: Routes = [
  { path: '', component: TaquillaComponent, title: 'Taquilla | Taquilla de Cine' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaquillaRoutingModule {}
