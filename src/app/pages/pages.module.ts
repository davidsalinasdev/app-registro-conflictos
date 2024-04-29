import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Formularios reactivos
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Componentes de PAGES
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { ReunionesComponent } from './reuniones/reuniones.component';
import { PorfechaComponent } from './reportes/porfecha/porfecha.component';



// Modulo personalizado SHARED
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';

// Editor de texto de angular
import { QuillModule } from 'ngx-quill';

// Notificaciones Toastr
import { ToastrModule } from 'ngx-toastr';

// Para imrpimir en PDF
import { NgxPrintModule } from 'ngx-print';
import { UsuariosComponent } from './usuarios/usuarios.component';

// Paginación
import { NgxPaginationModule } from 'ngx-pagination';

// Para cargar multiples archivos
import { FileUploadModule } from 'ng2-file-upload';

// Previsualizador PDF
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PortendenciaComponent } from './reportes/portendencia/portendencia.component';


@NgModule({
  declarations: [
    PagesComponent,
    HomeComponent,
    ReunionesComponent,
    PorfechaComponent,
    UsuariosComponent,
    PortendenciaComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    MaterialModule,
    NgxPrintModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule.forRoot(),
    ToastrModule.forRoot(), // ToastrModule added
    NgxPaginationModule,
    FileUploadModule,
    NgxExtendedPdfViewerModule

  ],
  exports: [
    PagesComponent,
    HomeComponent,
    ReunionesComponent,
    ReunionesComponent,
    PorfechaComponent,
    UsuariosComponent,
    PortendenciaComponent,

  ]
})
export class PagesModule { }
