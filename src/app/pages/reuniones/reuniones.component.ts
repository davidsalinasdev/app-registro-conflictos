import { environment } from './../../../environments/environment';

import { Component, OnInit } from '@angular/core';
// import { RestService } from './../rest.service';
import { DomSanitizer } from '@angular/platform-browser';

// Formularios reactivos
import { FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';

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

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { FileUploader } from 'ng2-file-upload';
// const URL = '/api/';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

import { HttpClient, HttpHeaders } from '@angular/common/http';


interface EstadoReunion {
  value: string;
  estado: string;
}

interface Tendencia {
  value: string;
  tendencia: string;
}

// Variables globales
const base_url = environment.base_url;

@Component({
  selector: 'app-reuniones',
  templateUrl: './reuniones.component.html',
  styleUrls: ['./reuniones.component.css']
})
export class ReunionesComponent implements OnInit {

  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  response: string;

  public urlImage = base_url;

  // Formularios reactivos
  public formulario!: FormGroup;
  public formularioModificar!: FormGroup;
  public formularioSearch!: FormGroup;

  public archivos: any = [];
  public previsualizacion: any = [];
  public tipoData: any = [];

  estados: EstadoReunion[] = [
    { value: 'Concluido', estado: 'Concluido' },
    { value: 'Pendiente', estado: 'Pendiente' }
  ];

  estadoReunion: EstadoReunion[] = [
    { value: 'Pendiente', estado: 'Pendiente' },
    { value: 'Concluido', estado: 'Concluido' }
  ];


  // Lista de todas reuniones
  public reuniones: any[] = [];

  // Historial
  public historia: any[] = [];

  // Lista para buscarReuniones
  public reunionesSearch: any[] = [];

  // loading
  public cargando: boolean = true;
  public cargandoBuscar: boolean = true;

  public idReunion: number = 0;

  public reunionMostrar?: Reunion;

  // Mostrar Reuniones
  public mostrarReunionHtml: boolean = true;

  public listDownload: any = [];



  // Paginación
  public current_page: any;
  public first_page_url: any;
  public from: any;
  public last_page: any;
  public last_page_url: any;
  public next_page_url: any;
  public path: any
  public per_page: any;
  public prev_page_url: any;
  public to: any
  public total: number = 0;
  public p: number = 1;
  // Fin Paginación

  // Paginación buscar
  public totalBuscar: number = 0;
  public pBuscar: number = 1;
  // Fin Paginación buscar

  // Mejorar el performance de la busqueda
  private OnDestroy$ = new Subject();
  public searchTerm$ = new Subject<string>();

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

  public usuario: any;
  public token: any;
  public rol: any;

  // Para deshabilitar el boton de guardar
  public btnSave: boolean = true;


  constructor(
    private fb: FormBuilder,
    private usuarioServices: UsuariosService,
    private toastr: ToastrService,
    private reunionesServices: ReunionesService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
    // private rest: RestService
  ) {

    this.crearFormulario();
    this.crearFormularioSearch()
    this.crearFormularioModificar();
    moment.locale('es');

    this.uploader = new FileUploader({
      url: URL,
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item: any) => {

        return new Promise((resolve, reject) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date()
          });
        });
      }
    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

    this.response = '';

    this.uploader.response.subscribe(res => {
      this.response = res

    });
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }
  ngOnInit(): void {


    this.submitSearch();
    this.indexReuniones();

    const user = localStorage.getItem('token');
    if (user) {
      const { token, identity } = JSON.parse(user);
      this.usuario = identity;
      this.token = token;
      this.rol = identity.rol;
    }

    // remover del localstorage
    localStorage.removeItem('textoBuscar')

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
      // nombres: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])],
      // apellidos: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)])],
      fecha_inicio: ['', [Validators.required]],
      hora_inicio: ['', [Validators.required]],
      lugar_reunion: ['', [Validators.required]],
      medida: ['', [Validators.required]],
      actor_demandante: ['', [Validators.required]],
      demanda: ['', [Validators.required]],
      actor_demandado: ['', [Validators.required]],
      situacion_actual: ['', [Validators.required]],
      nivel_tendencia: ['', [Validators.required]],
      fuente: [''],
    });
  }

  /**
   * crearFormularioModificar
   */
  public crearFormularioModificar() {
    this.formularioModificar = this.fb.group({
      fecha_inicioModificar: ['', [Validators.required]],
      hora_inicioModificar: ['', [Validators.required]],
      lugar_reunionModificar: ['', [Validators.required]],
      medidaModificar: ['', [Validators.required]],
      actor_demandanteModificar: ['', [Validators.required]],
      demandaModificar: ['', [Validators.required]],
      actor_demandadoModificar: ['', [Validators.required]],
      situacion_actualModificar: ['', [Validators.required]],
      nivel_tendenciaModificar: ['', [Validators.required]],
      fuenteModificar: [''],
      estadoModificar: ['', [Validators.required]],
    });
  }

  /**
   * crearFormularioSearch
   */
  public crearFormularioSearch() {
    this.formularioSearch = this.fb.group({
      texto: ['', [Validators.required]],
    });
  }

  // Para realizar busquedas
  get texto() {
    return this.formulario.get('texto');
  }


  // Para registrar
  get fecha_inicio() {
    return this.formulario.get('fecha_inicio');
  }

  get hora_inicio() {
    return this.formulario.get('hora_inicio');
  }

  get lugar_reunion() {
    return this.formulario.get('lugar_reunion');
  }

  get medida() {
    return this.formulario.get('medida');
  }

  get actor_demandante() {
    return this.formulario.get('actor_demandante');
  }

  get demanda() {
    return this.formulario.get('demanda');
  }

  get actor_demandado() {
    return this.formulario.get('actor_demandado');
  }

  get situacion_actual() {
    return this.formulario.get('situacion_actual');
  }

  get nivel_tendencia() {
    return this.formulario.get('nivel_tendencia');
  }

  get fuente() {
    return this.formulario.get('fuente');
  }


  /**
   * submitSearch
   */
  public submitSearch() {

    this.cargandoBuscar = true;


    this.searchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.OnDestroy$)
    )
      .subscribe(texto => {
        localStorage.setItem('textoBuscar', texto);

        if (texto.length === 0) {
          this.indexReuniones();
          localStorage.removeItem('textoBuscar');
        } else {
          const formData = {
            texto: texto
          }
          this.reunionesServices.searchReuniones(formData)
            .subscribe(({ reunionesSearch }) => {

              this.mostrarReunionHtml = false;
              this.cargandoBuscar = false;
              this.reunionesSearch = reunionesSearch.data;

              this.p = reunionesSearch.current_page;
              this.total = reunionesSearch.total;

              // Para paginación
              localStorage.setItem('position', `${this.p}`);
              localStorage.setItem('items', `${this.total}`);
            })
        }
      });
  }


  /**
   * submit
   */
  public submit(formDirective: FormGroupDirective) {

    // Para subir Archivos
    const datosBody = new FormData();
    for (let i = 0; i < this.archivos.length; i++) {
      datosBody.append('files[]', this.archivos[i]);
    }

    let usuarioActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { identity } = JSON.parse(infoToken);
      usuarioActual = identity;
    }

    const fecha_inicio = new Date(this.formulario.value.fecha_inicio).toLocaleDateString();
    const hora_inicio = this.formulario.value.hora_inicio;
    const lugar_reunion = this.formulario.value.lugar_reunion;
    const medida = (this.formulario.value.medida).toUpperCase();
    const actor_demandante = (this.formulario.value.actor_demandante).toUpperCase();
    const demanda = this.formulario.value.demanda;
    const actor_demandado = this.formulario.value.actor_demandado;
    const situacion_actual = this.formulario.value.situacion_actual;
    const nivel_tendencia = this.formulario.value.nivel_tendencia;
    const fuente = this.formulario.value.fuente;
    const usuarios_id = usuarioActual.sub;

    datosBody.append("fecha_inicio", fecha_inicio);
    datosBody.append("hora_inicio", hora_inicio);
    datosBody.append("lugar_reunion", lugar_reunion);
    datosBody.append("medida", medida);
    datosBody.append("actor_demandante", actor_demandante);
    datosBody.append("demanda", demanda);
    datosBody.append("actor_demandado", actor_demandado);
    datosBody.append("situacion_actual", situacion_actual);
    datosBody.append("nivel_tendencia", nivel_tendencia);
    datosBody.append("fuente", fuente);
    datosBody.append("usuarios_id", usuarios_id);

    // this.btnSave = false;
    this.usuarioServices.storeUsuario(datosBody)
      .subscribe(({ status, message, error, fecha_evaluacion }) => {
        console.log(fecha_evaluacion);

        if (status === 'success') {
          $('#myModal_agregar').modal('hide');
          this.indexReuniones();
          this.toastr.success(message, 'Sistema de Conflictos');
          this.borrarFormulario(formDirective);
        } else {
          this.toastr.error(message, 'Sistema de Conflictos');
          this.borrarFormulario(formDirective);
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
    // console.log('blur');
  }

  /**
   * onSelectionChanged
   */
  public onSelectionChanged() {
    // console.log('onSelectionChanged');
  }

  /**
   * indexReuniones
   */
  public indexReuniones() {
    this.mostrarReunionHtml = true;
    this.cargando = true;

    this.usuarioServices.indexUsuarios()
      .subscribe(({ reuniones }) => {
        this.reuniones = reuniones.data;
        this.cargando = false;

        const {
          current_page,
          first_page_url,
          from,
          last_page,
          last_page_url,
          next_page_url,
          path,
          per_page,
          prev_page_url,
          to,
          total
        } = reuniones;

        this.current_page = current_page;
        this.first_page_url = first_page_url;
        this.from = from;
        this.last_page = last_page;
        this.last_page_url = last_page_url;
        this.next_page_url = next_page_url;
        this.path = path;
        this.per_page = per_page;
        this.prev_page_url = prev_page_url;
        this.to = to;
        this.total = total;

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);

      })
  }

  /**
   * destroyPersona
   */
  public destroyReunion(id: number, medida: string, estado: string) {

    if (estado === 'Concluido') {
      this.toastr.error('Esta reunión ya esta concluida', 'Sistema de reuniones')
    } else {
      Swal.fire({
        title: 'Esta seguro de dar por concluido esta reunión?',
        text: `Medida: ${medida}`,
        icon: 'question',
        showCancelButton: true,
        cancelButtonText: 'Cancelar!',
        confirmButtonText: 'Si, concluir la reunión!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.usuarioServices.destroyPersona(id)
            .subscribe(({ status, message }) => {
              if (status === 'success') {
                this.indexReuniones();
                Swal.fire(
                  'La reunión fue dado por concluido',
                  `${message}`,
                  'success'
                );
              }

            }, (err) => {
              Swal.fire('Error', err.error.message, 'error')
            });
        }
      })

    }
  }

  /**
   * submitModificar
   */
  public submitModificar() {

    // Para subir Archivos
    const datosBody = new FormData();
    for (let i = 0; i < this.archivos.length; i++) {
      datosBody.append('files[]', this.archivos[i]);
    }

    let usuarioActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { identity } = JSON.parse(infoToken);
      usuarioActual = identity;
    }


    const fecha_inicio = new Date(this.formularioModificar.value.fecha_inicioModificar).toLocaleDateString();
    const hora_inicio = this.formularioModificar.value.hora_inicioModificar;
    const lugar_reunion = this.formularioModificar.value.lugar_reunionModificar;
    const medida = (this.formularioModificar.value.medidaModificar).toUpperCase();
    const actor_demandante = (this.formularioModificar.value.actor_demandanteModificar).toUpperCase();
    const demanda = this.formularioModificar.value.demandaModificar;
    const actor_demandado = this.formularioModificar.value.actor_demandadoModificar;
    const situacion_actual = this.formularioModificar.value.situacion_actualModificar;
    const nivel_tendencia = this.formularioModificar.value.nivel_tendenciaModificar;
    const fuente = this.formularioModificar.value.fuenteModificar;
    const estado = this.formularioModificar.value.estadoModificar;
    const usuarios_id = usuarioActual.sub;


    datosBody.append("fecha_inicio", fecha_inicio);
    datosBody.append("hora_inicio", hora_inicio);
    datosBody.append("lugar_reunion", lugar_reunion);
    datosBody.append("medida", medida);
    datosBody.append("actor_demandante", actor_demandante);
    datosBody.append("demanda", demanda);
    datosBody.append("actor_demandado", actor_demandado);
    datosBody.append("situacion_actual", situacion_actual);
    datosBody.append("nivel_tendencia", nivel_tendencia);
    datosBody.append("fuente", fuente);
    datosBody.append("estado", estado);
    datosBody.append("usuarios_id", usuarios_id);

    this.btnSave = false;
    this.reunionesServices.updateReuniones(datosBody, this.idReunion)
      .subscribe(({ message }) => {

        // Para mostrar la Busqueda
        if (this.mostrarReunionHtml) {
          this.indexPaginacion();
        } else {
          this.indexPaginacionBuscar();
        }

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
        this.btnSave = true;
      }, () => {
        this.btnSave = true;
      });
  }

  /**
   * modificarReunion
   */
  public modificarReunion(id: number) {
    let fecha: string = '';
    this.uploader.queue = [];
    this.archivos = [];
    this.idReunion = id;
    this.reunionesServices.showReuniones(id)
      .subscribe(({ reunion }) => {

        let arrayCadenas = reunion.fecha_inicio.split('/');

        const reverso = arrayCadenas.reverse()
        reverso.forEach((element: any) => {
          fecha = fecha + element + '-'
        });

        const ultimo = fecha.substring(0, fecha.length - 1);

        this.formularioModificar.setValue({

          fecha_inicioModificar: new Date(moment(ultimo).format('YYYY/MM/DD')).toISOString(),
          hora_inicioModificar: reunion.hora_inicio,
          lugar_reunionModificar: reunion.lugar_reunion,
          medidaModificar: reunion.medida,
          actor_demandanteModificar: reunion.actor_demandante,
          demandaModificar: reunion.demanda,
          actor_demandadoModificar: reunion.actor_demandado,
          situacion_actualModificar: reunion.situacion_actual,
          nivel_tendenciaModificar: reunion.nivel_tendencia,
          fuenteModificar: reunion.fuente,
          estadoModificar: reunion.estado

        });

      }, (err) => {
        Swal.fire('Error', err.error.message, 'error')
      });

    $('#myModal_modificar').modal('show');
  }

  /**
   * mostrarHistorial
   */
  public mostrarHistorial(id: number) {

    this.historia = [];

    $('#myModal_historial').modal('show');
    const formData = {
      id: id
    }
    this.reunionesServices.historial(formData)
      .subscribe(({ history }) => {
        this.historia = history;
      }, err => {
        console.log(err);
      });
  }


  // Validaciones para formulario
  get fecha_inicioModificar() {
    return this.formulario.get('fecha_inicioModificar');
  }

  get hora_inicioModificar() {
    return this.formulario.get('hora_inicioModificar');
  }

  get lugar_reunionModificar() {
    return this.formulario.get('lugar_reunionModificar');
  }

  get medidaModificar() {
    return this.formulario.get('medidaModificar');
  }

  get actor_demandanteModificar() {
    return this.formulario.get('actor_demandanteModificar');
  }

  get demandaModificar() {
    return this.formulario.get('demandaModificar');
  }

  get actor_demandadoModificar() {
    return this.formulario.get('actor_demandadoModificar');
  }

  get situacion_actualModificar() {
    return this.formulario.get('situacion_actualModificar');
  }

  get nivel_tendenciaModificar() {
    return this.formulario.get('nivel_tendenciaModificar');
  }

  get fuenteModificar() {
    return this.formulario.get('fuenteModificar');
  }

  get estadoModificar() {
    return this.formularioModificar.get('estadoModificar');
  }


  /**
   * name
   */
  public mostrarReunion(id: number) {
    this.reunionesServices.showReuniones(id)
      .subscribe(({ reunion }) => {
        this.reunionMostrar = reunion;
        $('#myModal_historial').modal('hide');
        $('#myModal_mostrar').modal('show');
      });
  }

  /**
 * MostrarReunionHistorial
 */
  public mostrarReunionHistorial(id: number) {
    this.reunionesServices.showReunionesHistorial(id)
      .subscribe(({ reunion }) => {
        this.reunionMostrar = reunion;
        // $('#myModal_historial').modal('hide');
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
   * borrarFormulario
   */
  public borrarFormulario(formDirective: FormGroupDirective) {
    this.uploader.queue = [];
    this.archivos = [];
    this.formulario.reset();
    if (this.formulario.valid || !this.formulario.valid) {
      formDirective.resetForm();
      this.formulario.reset();
    }
  }


  /**
   * pageChange(event)  
   */
  public pageChange(event: any) {

    this.cargando = true;
    this.p = event;
    const formData = {
      page: this.p
    }
    this.reunionesServices.indexReunionesPaginacion(formData)
      .subscribe(({ reuniones }) => {
        this.reuniones = reuniones.data;
        const {
          current_page,
          first_page_url,
          from,
          last_page,
          last_page_url,
          next_page_url,
          path,
          per_page,
          prev_page_url,
          to,
          total
        } = reuniones;

        this.current_page = current_page;
        this.first_page_url = first_page_url;
        this.from = from;
        this.last_page = last_page;
        this.last_page_url = last_page_url;
        this.next_page_url = next_page_url;
        this.path = path;
        this.per_page = per_page;
        this.prev_page_url = prev_page_url;
        this.to = to;
        this.total = total;
        this.cargando = false;

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })

  }

  /**
   * pageChangeBuscar
  */
  public pageChangeBuscar(event: any) {
    this.cargandoBuscar = true;
    const formData = {
      texto: localStorage.getItem('textoBuscar'),
      page: event
    }


    this.reunionesServices.searchReuniones(formData)
      .subscribe(({ reunionesSearch }) => {
        this.reunionesSearch = reunionesSearch.data;
        this.p = reunionesSearch.current_page;
        this.total = reunionesSearch.total;
        this.cargandoBuscar = false;

        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);

      })

  }


  /**
 * pageChange(event)  */
  public indexPaginacion() {

    this.p = Number(localStorage.getItem('position'));
    const formData = {
      page: this.p
    }

    this.reunionesServices.indexReunionesPaginacion(formData)
      .subscribe(({ reuniones }) => {
        this.reuniones = reuniones.data;

        const {
          current_page,
          first_page_url,
          from,
          last_page,
          last_page_url,
          next_page_url,
          path,
          per_page,
          prev_page_url,
          to,
          total
        } = reuniones;

        this.p = current_page;
        this.total = total;
        this.cargandoBuscar = false;

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })
  }


  /**
 * pageChange(event)  */
  public indexPaginacionBuscar() {

    // Recuperar del local stororage
    const formData = {
      page: this.p,
      texto: localStorage.getItem('textoBuscar')
    }

    this.reunionesServices.searchReuniones(formData)
      .subscribe(({ reunionesSearch }) => {

        this.mostrarReunionHtml = false;
        this.cargandoBuscar = false;
        this.reunionesSearch = reunionesSearch.data;
        this.total = reunionesSearch.total;

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);


      });

    this.p = Number(localStorage.getItem('position'));
    localStorage.setItem('position', `${this.p}`);

  }

  /**
   * capturarFiles
   */
  public capturarFiles(event: any) {

    this.previsualizacion = [];
    this.archivos = [];


    const archivosCapturados = this.uploader.queue;
    for (let index = 0; index < archivosCapturados.length; index++) {

      this.extraerBase64(archivosCapturados[index]._file).then((imagen: any) => {
        this.previsualizacion.push(imagen.base);
      })
      this.archivos.push(archivosCapturados[index]._file);

    }

  }


  // Codigo para convertir a base 64

  extraerBase64 = async ($event: any) => new Promise((resolve, reject): void => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      throw new Error(`Existe un error: ${e}`);
    }
  })

  /**
   * listArchivos
   */
  public listArchivos(id: number) {
    $('#myModal_archivos').modal('show');
    this.reunionesServices.listArchivos(id)
      .subscribe(({ archivo }) => {
        this.listDownload = archivo;
      })
  }

  /**
  * listArchivos
  */
  public listArchivosHistorial(id: number) {
    $('#myModal_archivos_historial').modal('show');
    this.reunionesServices.listArchivosHistorial(id)
      .subscribe(({ archivo }) => {
        this.listDownload = archivo;
      })
  }

  public getArchivos(id: number) {

    const url = `${base_url}/api/reuniones/getarchivos/${id}`;
    this.http.get(url, { responseType: 'blob' })
      .subscribe(blob => {
        const urlBlob = window.URL.createObjectURL(blob);
        const embed = document.createElement('embed');
        embed.src = urlBlob;
        embed.type = blob.type;
        embed.style.width = '100%';
        embed.style.height = '100%';
        embed.id = 'embed'
        $('#myModal_descargas').modal('show');
        $('#myModal_archivos').modal('hide');

        // Seleccionar un elemento existente con un atributo id igual a "files-contenido"
        const miDiv = document.getElementById('files-contenido');

        // Crear un nuevo elemento div si aún no existe
        let newDiv = document.getElementById('files-descargas');
        if (!newDiv) {
          newDiv = document.createElement('div');
          newDiv.id = 'files-descargas';
          newDiv.style.height = '600px';
          miDiv?.appendChild(newDiv);
        }

        // Verificar si ya hay un elemento embed en el nuevo div
        let embedExists = false;
        for (let i = 0; i < newDiv.childNodes.length; i++) {
          const childNode = newDiv.childNodes[i];
          if (childNode.nodeType === Node.ELEMENT_NODE && (childNode as Element).tagName === 'EMBED') {
            embedExists = true;
            // Reemplazar el elemento embed existente con uno nuevo
            newDiv.replaceChild(embed, newDiv.childNodes[i]);
            break;
          }
        }

        // Si no hay un elemento embed existente, agregar uno nuevo
        if (!embedExists) {
          newDiv.appendChild(embed);
        }

      });
  }

  /**
   * descargarImagen
   */
  public descargarImagen() {
    // Obtener el elemento embed

    const embed = document.getElementById('embed');

    // Verificar si el tipo de documento es una imagen
    if ((embed as HTMLEmbedElement).type === 'image/jpeg' || (embed as HTMLEmbedElement).type === 'image/png' || (embed as HTMLEmbedElement).type === 'image/gif') {
      // Obtener la URL del archivo de imagen
      const imageUrl = (embed as HTMLEmbedElement).src;

      // Utilizar fetch para obtener los datos de la imagen
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          // Crear un enlace de descarga para la imagen
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.download = 'imagen.png'; // Nombre del archivo a descargar
          downloadLink.click();
        });
    } else {
      const pdfUrl = (embed as HTMLEmbedElement).src;
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.download = 'archivo.pdf'; // Nombre del archivo a descargar
          downloadLink.click();
        });
    }
  }

  /**
* getArchivosHistorial
*/
  public getArchivosHistorial(id: number) {
    const url = `${base_url}/api/reuniones/getarchivoshistorial/${id}`;
    this.http.get(url, { responseType: 'blob' })
      .subscribe(blob => {
        const urlBlob = window.URL.createObjectURL(blob);
        const embed = document.createElement('embed');
        embed.src = urlBlob;
        embed.type = blob.type;
        embed.style.width = '100%';
        embed.style.height = '100%';
        embed.id = 'embed'
        $('#myModal_descargas').modal('show');
        $('#myModal_archivos_historial').modal('hide');

        // Seleccionar un elemento existente con un atributo id igual a "files-contenido"
        const miDiv = document.getElementById('files-contenido');

        // Crear un nuevo elemento div si aún no existe
        let newDiv = document.getElementById('files-descargas');
        if (!newDiv) {
          newDiv = document.createElement('div');
          newDiv.id = 'files-descargas';
          newDiv.style.height = '600px';
          miDiv?.appendChild(newDiv);
        }

        // Verificar si ya hay un elemento embed en el nuevo div
        let embedExists = false;
        for (let i = 0; i < newDiv.childNodes.length; i++) {
          const childNode = newDiv.childNodes[i];
          if (childNode.nodeType === Node.ELEMENT_NODE && (childNode as Element).tagName === 'EMBED') {
            embedExists = true;
            // Reemplazar el elemento embed existente con uno nuevo
            newDiv.replaceChild(embed, newDiv.childNodes[i]);
            break;
          }
        }

        // Si no hay un elemento embed existente, agregar uno nuevo
        if (!embedExists) {
          newDiv.appendChild(embed);
        }

      });
  }


  /**
   * deleteArchivos
   */
  public destroyArchivos(id: number, reuniones_id: number) {
    this.reunionesServices.destroyArchivos(id)
      .subscribe(({ message }) => {
        this.toastr.success(message)
        this.listArchivos(reuniones_id);
      })
  }


}
