import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes de PAGES
import { PagesComponent } from './pages.component';

// Servicios
import { AuthGuard } from './../guards/auth.guard';

const routes: Routes = [
  // Rutas PROTEGIDAS como hijas de app-routing.module.ts
  {
    // Cuando el path sea vacio va redireciones aun sub moduloComonenete
    path: 'home', // ruta padre
    component: PagesComponent,
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],

    loadChildren: () => import('./child-routes.module').then(m => m.ChildRoutesModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
