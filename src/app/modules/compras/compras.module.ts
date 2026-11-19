import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { ComprasRoutingModule } from './compras-routing.module';
import { ComprasComponent } from './compras.component';

@NgModule({
  declarations: [ComprasComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, ComprasRoutingModule],
})
export class ComprasModule {}