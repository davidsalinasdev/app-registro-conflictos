import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Rutas secundarias utilizadas en el routing principal
import { AuthRoutingModule } from './auth/auth-routing.module';
import { PagesRoutingModule } from './pages/pages-routing.module';

// Componentes de APP
import { NopagescomponentComponent } from './nopagescomponent/nopagescomponent.component';

const routes: Routes = [
  // Si es un path vacio va a redirecionar a -> home y esto a un -> path: '', component: DashboardComponent
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Cualquiera otra ruta que no este definida en este routing va a mostrar NoPagesFound
  { path: '**', component: NopagescomponentComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AuthRoutingModule,
    PagesRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
