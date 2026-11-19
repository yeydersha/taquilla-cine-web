import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { PeliculaFormComponent } from './components/pelicula-form/pelicula-form.component';
import { PeliculasRoutingModule } from './peliculas-routing.module';
import { PeliculasComponent } from './peliculas.component';

@NgModule({
  declarations: [PeliculasComponent, PeliculaFormComponent],
  imports: [SharedModule, ReactiveFormsModule, PeliculasRoutingModule],
})
export class PeliculasModule {}
