import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Rutas principales. Cada módulo funcional se carga de forma diferida.
 * La ruta inicial redirige a /peliculas.
 */
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'peliculas' },
  {
    path: 'peliculas',
    loadChildren: () =>
      import('./modules/peliculas/peliculas.module').then((m) => m.PeliculasModule),
  },
  {
    path: 'funciones',
    loadChildren: () =>
      import('./modules/funciones/funciones.module').then((m) => m.FuncionesModule),
  },
  {
    path: 'compras',
    loadChildren: () =>
      import('./modules/compras/compras.module').then((m) => m.ComprasModule),
  },
  {
    path: 'taquilla',
    loadChildren: () =>
      import('./modules/taquilla/taquilla.module').then((m) => m.TaquillaModule),
  },
  { path: '**', redirectTo: 'peliculas' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
