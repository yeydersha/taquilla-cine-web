import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { FuncionFormComponent } from './components/funcion-form/funcion-form.component';
import { FuncionesRoutingModule } from './funciones-routing.module';
import { FuncionesComponent } from './funciones.component';

@NgModule({
  declarations: [FuncionesComponent, FuncionFormComponent],
  imports: [SharedModule, ReactiveFormsModule, FuncionesRoutingModule],
})
export class FuncionesModule {}