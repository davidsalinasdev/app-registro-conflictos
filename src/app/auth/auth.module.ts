import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Rutas derivadas en la ruta principal
import { AuthRoutingModule } from './auth-routing.module';
import { PagesRoutingModule } from '../pages/pages-routing.module';

// Formularios reactivos
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Para peticiones http
import { HttpClientModule } from "@angular/common/http";

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// Notificaciones Toastr
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    PagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(), // ToastrModule added
  ],
  exports: [
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule { }
