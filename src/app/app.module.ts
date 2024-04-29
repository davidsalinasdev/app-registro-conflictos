import { RouterModule } from '@angular/router';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Routing principal de APP
import { AppRoutingModule } from './app-routing.module';

// Componentes principales de APP
import { AppComponent } from './app.component';
import { NopagescomponentComponent } from './nopagescomponent/nopagescomponent.component';

// Modulos personalizados
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';

// Para peticiones HTTP
import { HttpClientModule } from '@angular/common/http';

// Para refrescar la pagina WEB
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

// Formulario reactivos
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


// Idioma español
import localeEs from "@angular/common/locales/es";
import { registerLocaleData } from "@angular/common";
registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent,
    NopagescomponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    PagesModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // Para el lenguaje español
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
