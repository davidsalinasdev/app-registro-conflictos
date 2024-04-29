import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes de AUTH
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  /**** Rutas PUBLICAS Principales como hijas de app-routing.module.ts****/
  { path: 'login', component: LoginComponent, data: { titulo: 'Login' } },
  { path: 'register', component: RegisterComponent, data: { titulo: 'Registro de Usuarios' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
