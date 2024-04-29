import { Injectable } from '@angular/core';

// Para manejar las peticiones http// 
import { HttpClient, HttpHeaders } from '@angular/common/http';

// El tap un efecto secuendario
import { tap, map, catchError } from "rxjs/operators";
import { Observable, of, Subject } from 'rxjs';

// Variables globales
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';

// Variables globales
import { environment } from './../../environments/environment';
const base_url = environment.base_url;


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Token de usuario
  get token() {
    let tokenActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { token } = JSON.parse(infoToken);
      tokenActual = token;
    }
    return tokenActual;
  }

  // Servicio para el login
  /**
   * login
   */
  public login(formData: Usuario) {
    // console.log(formData);
    return this.http.post(`${base_url}/api/login`, formData)
      .pipe(
        tap((resp: any) => {
          localStorage.setItem('token', JSON.stringify(resp))
        })
      )
  }

  // Servicio para el login
  /**
   * loginChangesPassword
   */
  public loginChangesPassword(formData: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.post<any>(`${base_url}/api/login`, formData, { headers: parameters });
  }

  /**
   * ValidarToken
   */
  public validarToken(): Observable<boolean> {

    const token = localStorage.getItem('token') || '';

    // Implementando rxjs
    let tokenInfo$: Observable<string>;
    tokenInfo$ = of(token);
    return tokenInfo$.pipe(
      tap((resp: any) => {
        // console.log(resp);
        if (resp != '') {
          localStorage.setItem('token', resp);
        }
      }),
      map(resp => (resp === '') ? false : true)
    );

  }

  /**
   * indexUsuarios
   */
  public indexUsuarios() {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.get<any>(base_url + '/api/reuniones', { headers: parameters });
  }

  /**
 * indexSecretarias
 */
  public indexSecretarias() {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.get<any>(base_url + '/api/secretarias', { headers: parameters });
  }

  /**
 * indexUsuarios
 */
  public indexPagesChanges(pagina: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.post<any>(base_url + '/api/user/userpaginacion', pagina, { headers: parameters });
  }

  /**
* indexUsuarios
*/
  public indexPagesChangesBuscar(pagina: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.post<any>(base_url + '/api/user/userpaginaciobuscar', pagina, { headers: parameters });
  }

  /**
  * indexUsuarios
  */
  public indexUsuario(page: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.post<any>(base_url + '/api/user/indexusuario', page, { headers: parameters });
  }

  /**
  * indexUsuarios
  */
  public indexUsuarioBuscar(page: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token!);
    return this.http.post<any>(base_url + '/api/user/searchusuarios', page, { headers: parameters });
  }

  /**
   * storeUsuario
   */
  public storeUsuario(reuniones: any) {

    // console.log(reuniones);

    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.post<any>(base_url + '/api/reuniones', reuniones, { headers: parameters });
  }

  /**
 * storeUsuario
 */
  public storeUsuarioDos(usuarios: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.post<any>(base_url + '/api/user', usuarios, { headers: parameters });
  }


  /**
* storeUsuario
*/
  public updateChangesPassword(password: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.post<any>(base_url + '/api/user/changespassword', password, { headers: parameters });
  }


  /**
   * eliminar Evento
   */
  public destroyPersona(id: number) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.delete<any>(base_url + '/api/reuniones/' + id, { headers: parameters });
  }

  /**
   * eliminar Evento
   */
  public destroyUsuario(id: number) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.delete<any>(base_url + '/api/user/' + id, { headers: parameters });
  }

  /**
    * Usuario Alta
    */
  public altaUsuario(id: number) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.delete<any>(base_url + '/api/user/altausuario/' + id, { headers: parameters });
  }

  /**
 * Buscar re9uniones
 */
  public searchUsuarios(usuarios: any) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.post<any>(base_url + '/api/user/searchusuarios', usuarios, { headers: parameters });
  }



  /**
    * Traer un registro de secretario
    */
  public showSecretario(id: number) {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.get<any>(base_url + '/api/secretarias/' + id, { headers: parameters });
  }

}
