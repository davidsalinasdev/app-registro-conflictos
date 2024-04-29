import { Usuario } from './../../models/usuario.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

// Formularios reactivos
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

// Servicios de usuario
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ReunionesService } from 'src/app/services/reuniones.service';

// Modelo
import { Reunion } from './../../models/reunion.model';

// Motras ntificaciones en tarjetas
import Swal from 'sweetalert2';

import { ToastrService } from 'ngx-toastr';

// Utilizando jquery
declare var JQuery: any;
declare var $: any;

// Manejo de fechas
import * as moment from 'moment';

// Sanetizar HTML
import * as sanitizeHtml from 'sanitize-html';

// Observables
import { Observable, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Operadores rxjs
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

interface Estado {
  value: number;
  estado: string;
}

// Variables globales
import { environment } from './../../../environments/environment';
const base_url = environment.base_url;

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  // Formularios reactivos
  public formulario!: FormGroup;
  public formularioModificar!: FormGroup;

  estados: Estado[] = [
    { value: 0, estado: 'Inhabilitado' },
    { value: 1, estado: 'Habilitado' }
  ];

  estadoReunion: Estado[] = [
    { value: 0, estado: 'Pendiente' },
    { value: 1, estado: 'Concluido' }
  ];

  roles: Estado[] = [
    { value: 0, estado: 'Normal' },
    { value: 1, estado: 'Administrador' },
  ];

  // Lista de todas reuniones
  public reuniones: any[] = [];

  // Lista de usuarios
  public usuarios: any[] = [];

  // Lista de secretarias
  public secretarias: any[] = [];

  // loading
  public cargando: boolean = true;
  public cargandoBuscar: boolean = true;

  public idReunion: number = 0;

  public reunionMostrar?: Reunion;

  // Propiedades para editor de texto
  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'header': [2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'align': [] }],
        ['clean'],
        ['link']
      ]
    }
  }

  public total: number = 0;
  public p: number = 1;
  public tendencia: any = [];
  public latencia: string = '';
  // Mostrar tabla
  public mostrarTabla: boolean = false;

  // Mejorar el performance de la busqueda
  private OnDestroy$ = new Subject();
  public searchTerm$ = new Subject<string>();

  // Lista para buscarUsuarios
  public usersSearch: any[] = [];

  // Paginación buscar
  public totalBuscar: number = 0;
  public pBuscar: number = 1;
  // Fin Paginación buscar

  // Mostrar Reuniones
  public mostrarReunionHtml: boolean = true;

  public isDisabled: boolean = true;

  // Para deshabilitar el boton de guardar
  public btnSave: boolean = true;

  constructor(
    private fb: FormBuilder,
    private usuarioServices: UsuariosService,
    private toastr: ToastrService,
    private reunionesServices: ReunionesService,
    private http: HttpClient,
  ) {
    this.crearFormulario();
    this.crearFormularioModificar();
    moment.locale('es');
  }

  ngOnInit(): void {
    this.submitSearch();
    this.indexUsuarios();
    this.indexSecretarias();
    localStorage.removeItem('textoBuscar');
  }

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

  get idSecretaria() {
    let idActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { identity } = JSON.parse(infoToken);
      idActual = identity.secretaria_id;
    }
    return idActual;
  }

  /**
  * crearFormulario
  */
  public crearFormulario() {
    this.formulario = this.fb.group({
      nombres: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])],
      apellidos: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])],
      usuario: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(20)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      rol: ['', [Validators.required]],
      secretaria: ['', [Validators.required]],
    });
  }

  // Validaciones para formulario
  get nombres() {
    return this.formulario.get('nombres');
  }
  get apellidos() {
    return this.formulario.get('apellidos');
  }
  get usuario() {
    return this.formulario.get('usuario');
  }
  get password() {
    return this.formulario.get('password');
  }

  get rol() {
    return this.formulario.get('rol');
  }

  get secretaria() {
    return this.formulario.get('secretaria');
  }

  /**
   * crearFormularioModificar
   */
  public crearFormularioModificar() {
    this.formularioModificar = this.fb.group({
      motivoModificar: ['', [Validators.required]],
      asuntoModificar: ['', [Validators.required]],
      prioridadModificar: ['', [Validators.required]],
      fecha_reunionModificar: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      estado_reunion: ['', [Validators.required]],
    });
  }

  /**
   * onInputChange
   */
  public onInputChange(event: KeyboardEvent) {
    const nombres = (event.target as HTMLInputElement).value;

    if (nombres === '') {
      this.formulario.get('usuario')!.setValue('');
      this.formulario.get('password')!.setValue('');
    } else {
      this.generateUserCredentials(nombres, '-gadc')
        .subscribe(({ username, password }) => {
          this.formulario.patchValue({
            usuario: username,
            password: password
          })

        })
    }

  }

  public generateUserCredentials(firstName: string, lastName: string): Observable<any> {

    const newString = firstName.replace(/\s+/g, '');

    const username = `${newString.toLowerCase()}${lastName.toLowerCase()}`;
    const password = this.generatePassword();

    return this.checkUsernameAvailability(username).pipe(
      switchMap((isAvailable: any) => {
        if (isAvailable.exist === 'no') {
          return of({ username, password });
        } else {
          const newUsername = `${username}_${this.generateRandomString(1)}`;
          return of({ username: newUsername, password });
        }
      })
    )

  }

  public checkUsernameAvailability(username: string): Observable<any> {
    let parameters = new HttpHeaders();
    parameters = parameters.set('token-usuario', this.token);
    return this.http.post<any>(base_url + '/api/user/siexisteusuario', { usuario: username }, { headers: parameters });
  }

  public generatePassword(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  }

  public generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
  }

  /**
   * submit
   */
  public submit() {

    this.btnSave = false;
    this.usuarioServices.storeUsuarioDos(this.formulario.value)
      .subscribe(({ status, message }) => {

        if (status === 'success') {
          $('#myModal_agregar').modal('hide');
          this.indexUsuarios();
          this.toastr.success(message, 'Sistema de Conflictos');
        } else {
          this.toastr.error(message, 'Sistema de Conflictos');
        }
      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.message, 'error')
        this.btnSave = true;
      }, () => {
        this.btnSave = true;
      });
  }

  // Editor de texto

  /**
   * blur
   */
  public blur() {
    console.log('blur');
  }

  /**
   * onSelectionChanged
   */
  public onSelectionChanged() {
    console.log('onSelectionChanged');
  }

  /**
   * indexReuniones
   */
  public indexUsuarios() {
    this.mostrarReunionHtml = true;
    this.cargando = true;
    const formData = {
      page: this.p
    }

    this.usuarioServices.indexUsuario(formData)
      .subscribe(({ usuarios }) => {
        const { data, current_page, total } = usuarios;
        this.usuarios = data;
        this.p = current_page;
        this.total = total;
        this.cargando = false;

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })
  }

  /**
  * indexReuniones
  */
  public indexUsuariosBuscar() {
    this.usersSearch = [];
    this.mostrarReunionHtml = true;
    this.cargando = true;
    const formData = {
      texto: localStorage.getItem('textoBuscar'),
      page: this.p
    }

    this.usuarioServices.indexUsuarioBuscar(formData)
      .subscribe(({ usersSearch }) => {
        const { data, current_page, total } = usersSearch;
        this.usersSearch = data;
        this.p = current_page;
        this.total = total;
        this.cargando = false;
        this.mostrarReunionHtml = false;
        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })
  }

  /**
   * indexSecretarias
   */
  public indexSecretarias() {

    this.usuarioServices.indexSecretarias()
      .subscribe(({ secretarias }) => {
        this.secretarias = secretarias;
      })


  }

  /**
   * destroyPersona
   */
  public destroyUsuario(id: number, nombres: string, apellidos: string) {


    let usuarioActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { identity } = JSON.parse(infoToken);
      usuarioActual = identity;
    }

    if (usuarioActual.sub != id) {

      Swal.fire({
        title: 'Esta Seguro de Eliminar?',
        text: `Esta a punto de eliminar al usuario: ${nombres} ${apellidos}`,
        icon: 'question',
        showCancelButton: true,
        cancelButtonText: 'Cancelar!',
        confirmButtonText: 'Si, dar de Baja!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.usuarioServices.destroyUsuario(id)
            .subscribe(({ status, message }) => {
              if (status === 'success') {
                this.indexUsuarios();
                Swal.fire(
                  'Usuario dado de Baja!',
                  `${message}`,
                  'success'
                );
              }


            }, (err) => {
              Swal.fire('Error', err.error.message, 'error')
            });
        }
      })

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Eliminación no valida..!',
        text: 'No puedes eliminarte asi mismo..',
        footer: 'Gobierno Autónomo Departamental de Cochabamba'
      })
    }

  }


  /**
   * destroyPersona
   */
  public destroyUsuarioBuscar(id: number, nombres: string, apellidos: string) {

    let usuarioActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { identity } = JSON.parse(infoToken);
      usuarioActual = identity;
    }

    if (usuarioActual.sub != id) {

      Swal.fire({
        title: 'Esta Seguro de Eliminar?',
        text: `Esta a punto de eliminar al usuario: ${nombres} ${apellidos}`,
        icon: 'question',
        showCancelButton: true,
        cancelButtonText: 'Cancelar!',
        confirmButtonText: 'Si, dar de Baja!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.usuarioServices.destroyUsuario(id)
            .subscribe(({ status, message }) => {
              if (status === 'success') {

                this.indexUsuariosBuscar();
                Swal.fire(
                  'Usuario dado de Baja!',
                  `${message}`,
                  'success'
                );
              }


            }, (err) => {
              Swal.fire('Error', err.error.message, 'error')
            });
        }
      })

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Eliminación no valida..!',
        text: 'No puedes eliminarte asi mismo..',
        footer: 'Gobierno Autónomo Departamental de Cochabamba'
      })
    }

  }


  /**
   * Alta a usuario
   */
  public altaUsuario(id: number, nombres: string, apellidos: string) {

    Swal.fire({
      title: 'Esta Seguro de dar de alta?',
      text: `Esta a punto de dar de alta a: ${nombres} ${apellidos}`,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar!',
      confirmButtonText: 'Si, dar de Alta!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioServices.altaUsuario(id)
          .subscribe(({ status, message }) => {
            if (status === 'success') {
              this.indexUsuarios();
              Swal.fire(
                'Usuario dado de Alta!',
                `${message}`,
                'success'
              );
            }
          }, (err) => {
            console.log(err);

            Swal.fire('Error', err.error.message, 'error')
          });
      }
    })


  }

  /**
    * Alta a usuarioBuscar
    */
  public altaUsuarioBuscar(id: number, nombres: string, apellidos: string) {

    Swal.fire({
      title: 'Esta Seguro de dar de alta?',
      text: `Esta a punto de dar de alta a: ${nombres} ${apellidos}`,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar!',
      confirmButtonText: 'Si, dar de Alta!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioServices.altaUsuario(id)
          .subscribe(({ status, message }) => {
            if (status === 'success') {
              this.indexUsuariosBuscar();
              Swal.fire(
                'Usuario dado de Alta!',
                `${message}`,
                'success'
              );
            }
          }, (err) => {
            console.log(err);

            Swal.fire('Error', err.error.message, 'error')
          });
      }
    })


  }



  /**
   * submitModificar
   */
  public submitModificar() {
    const formData = {
      motivo: (this.formularioModificar.value.motivoModificar).toUpperCase(),
      asunto: this.formularioModificar.value.asuntoModificar,
      prioridad: this.formularioModificar.value.prioridadModificar,
      fecha_reunion: new Date(this.formularioModificar.value.fecha_reunionModificar).toLocaleDateString(),
      estado: this.formularioModificar.value.estado,
      estado_reunion: this.formularioModificar.value.estado_reunion,
    }

    this.reunionesServices.updateReuniones(formData, this.idReunion)
      .subscribe(({ message }) => {
        this.indexUsuarios();
        $('#myModal_modificar').modal('hide');
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '¡Modificación Correcta!',
          text: `${message}`,
          showConfirmButton: false,
          timer: 3000
        })
      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.message, 'error')
      }
      );
  }

  /**
   * modificarReunion
   */
  public modificarReunion(id: number) {
    this.idReunion = id;

    this.reunionesServices.showReuniones(id)
      .subscribe(({ reunion }) => {

        this.formularioModificar.setValue({
          motivoModificar: reunion.motivo,
          asuntoModificar: reunion.asunto,
          prioridadModificar: reunion.prioridad,
          fecha_reunionModificar: new Date(moment(reunion.fecha_reunion).format('YYYY/MM/DD')).toISOString(),
          estado: reunion.estado,
          estado_reunion: reunion.estado_reunion
        });

      }, (err) => {
        Swal.fire('Error', err.error.message, 'error')
      });

    $('#myModal_modificar').modal('show');
  }


  // Validaciones para formulario
  get motivoModificar() {
    return this.formularioModificar.get('motivoModificar');
  }
  get asuntoModificar() {
    return this.formularioModificar.get('asuntoModificar');
  }
  get prioridadModificar() {
    return this.formularioModificar.get('prioridadModificar');
  }
  get fecha_reunionModificar() {
    return this.formularioModificar.get('fecha_reunionModificar');
  }
  get estado() {
    return this.formularioModificar.get('estado');
  }
  get estado_reunion() {
    return this.formularioModificar.get('estado_reunion');
  }

  /**
   * name
   */
  public mostrarReunion(id: number) {
    this.reunionesServices.showReuniones(id)
      .subscribe(({ reunion }) => {
        this.reunionMostrar = reunion;
        $('#myModal_mostrar').modal('show');
      });
  }

  /**
   * imprimirPDF
   */
  public imprimirPDF() {
    $('#myModal_mostrar').modal('hide');
  }

  /**
* pageChange(event)  
*/
  public pageChange(event: any) {

    this.cargando = true;
    this.p = event; // numero de página

    const formData = {
      page: this.p,
    }

    this.usuarioServices.indexPagesChanges(formData)
      .subscribe(({ usuarios }) => {
        const { data, total, current_page } = usuarios;
        this.usuarios = data;
        this.p = current_page;
        this.total = total;
        this.cargando = false;
        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      });

  }

  /**
    * submitSearch
    */
  public submitSearch() {
    this.usersSearch = [];
    this.cargandoBuscar = true;

    this.searchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.OnDestroy$)
    )
      .subscribe(texto => {
        localStorage.setItem('textoBuscar', texto);

        if (texto.length === 0) {
          this.indexUsuarios();
          localStorage.removeItem('textoBuscar');
        } else {
          const formData = {
            texto: texto
          }
          this.usuarioServices.searchUsuarios(formData)
            .subscribe(({ usersSearch }) => {

              this.mostrarReunionHtml = false;
              this.usersSearch = usersSearch.data;
              this.p = usersSearch.current_page;
              this.total = usersSearch.total;
              this.cargandoBuscar = false;

              // Para paginación
              localStorage.setItem('position', `${this.p}`);
              localStorage.setItem('items', `${this.total}`);
            })
        }
      });


  }

  /**
  * pageChangeBuscar
 */
  public pageChangeBuscar(event: any) {

    this.cargandoBuscar = true;
    this.p = event; // numero de página

    const formData = {
      page: this.p,
      texto: localStorage.getItem('textoBuscar')
    }
    this.usuarioServices.searchUsuarios(formData)
      .subscribe(({ usersSearch }) => {
        this.mostrarReunionHtml = false;
        this.cargandoBuscar = false;
        this.usersSearch = usersSearch.data;
        this.p = usersSearch.current_page;
        this.total = usersSearch.total;

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })

  }

  /**
   * borrarFormulario
   */
  public borrarFormulario(formDirective: FormGroupDirective) {
    this.formulario.reset();
    if (this.formulario.valid || !this.formulario.valid) {
      formDirective.resetForm();
      this.formulario.reset();
    }
  }

  /**
   * secretaria
   */
  public getSecretaria() {
    this.usuarioServices.showSecretario(this.idSecretaria)
      .subscribe(({ secretaria }) => {
        this.formulario.reset({
          secretaria: secretaria.id
        });
      });
  }

}
