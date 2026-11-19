import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { TaquillaRoutingModule } from './taquilla-routing.module';
import { TaquillaComponent } from './taquilla.component';

@NgModule({
  declarations: [TaquillaComponent],
  imports: [SharedModule, ReactiveFormsModule, TaquillaRoutingModule],
})
export class TaquillaModule {}