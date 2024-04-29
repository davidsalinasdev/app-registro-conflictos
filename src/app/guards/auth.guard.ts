import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Servicios
import { UsuariosService } from '../services/usuarios.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

    constructor(
        private usuarioServices: UsuariosService,
        private router: Router
    ) { }


    canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.usuarioServices.validarToken()
            .pipe(
                tap(estaAutenticado => {
                    if (!estaAutenticado) {
                        // console.log('Hola1');

                        this.router.navigateByUrl('/login');
                    }
                })
            );
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot) {

        return this.usuarioServices.validarToken()
            .pipe(
                tap(estaAutenticado => {
                    if (!estaAutenticado) {
                        this.router.navigateByUrl('/login');
                    }
                })
            );
    }


}