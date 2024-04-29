import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// Componetes de PAGES
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ReunionesComponent } from './reuniones/reuniones.component';
import { PorfechaComponent } from './reportes/porfecha/porfecha.component';
import { PortendenciaComponent } from './reportes/portendencia/portendencia.component';



const routes: Routes = [
    // Home
    { path: '', component: HomeComponent, data: { titulo: 'Tendencias' } }, // Path inicial
    { path: 'reuniones', component: ReunionesComponent, data: { titulo: 'Reuniones' } }, // Path inicial
    { path: 'porfecha', component: PorfechaComponent, data: { titulo: 'Reporte por rango de fechas' } }, // Path inicial
    { path: 'portendencia', component: PortendenciaComponent, data: { titulo: 'Reporte por estado de tendencia' } }, // Path inicial
    { path: 'usuarios', component: UsuariosComponent, data: { titulo: 'Gestión de usuarios' } }, // Path inicial

    // { path: 'correspondencia', component: CorrespondenciaComponent, data: { titulo: 'Correspondencia' } }, // Path inicial
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChildRoutesModule { }