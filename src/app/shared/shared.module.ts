import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MaterialModule } from '../material/material.module';

// Componentes de SHARED
import { MenunavegacionComponent } from './menunavegacion/menunavegacion.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MenunavegacionComponent,
    BreadcrumbsComponent,
    BreadcrumbsComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MenunavegacionComponent,
    BreadcrumbsComponent,
    FooterComponent
  ]
})
export class SharedModule { }
