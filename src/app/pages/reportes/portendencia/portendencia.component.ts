import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Reunion } from 'src/app/models/reunion.model';

// Servicios
import { ReunionesService } from 'src/app/services/reuniones.service';

// Utilizando jquery
declare var JQuery: any;
declare var $: any;

import { FileUploader } from 'ng2-file-upload';
// const URL = '/api/';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

// Manejo de fechas
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Motras ntificaciones en tarjetas
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

interface EstadoReunion {
  value: string;
  estado: string;
}

import { environment } from './../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from 'src/app/services/usuarios.service';

// Variables globales
const base_url = environment.base_url;

@Component({
  selector: 'app-portendencia',
  templateUrl: './portendencia.component.html',
  styleUrls: ['./portendencia.component.css']
})
export class PortendenciaComponent implements OnInit {

  public latente: number = 0;
  public temprano: number = 0;
  public precrisis: number = 0;
  public crisis: number = 0;

  public tendencia: any = [];
  public latencia: string = '';

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

  public reunionMostrar?: Reunion;

  // Lista de todas reuniones
  public reuniones: any[] = [];

  // loading
  public cargando: boolean = true;

  // Mostrar tabla
  public mostrarTabla: boolean = false;

  public listDownload: any = [];

  public usuario: any;
  public token: any;
  public rol: any;

  // Historial
  public historia: any[] = [];

  uploader: FileUploader;
  // hasBaseDropZoneOver: boolean;
  // hasAnotherDropZoneOver: boolean;
  // response: string;

  public archivos: any = [];
  public idReunion: number = 0;

  public formularioModificar!: FormGroup;

  // Para deshabilitar el boton de guardar
  public btnSave: boolean = true;

  public previsualizacion: any = [];

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

  estados: EstadoReunion[] = [
    { value: 'Concluido', estado: 'Concluido' },
    { value: 'Pendiente', estado: 'Pendiente' }
  ];

  public urlImage = base_url;

  constructor(
    private reunionServices: ReunionesService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private toastr: ToastrService,
    private usuarioServices: UsuariosService,
  ) {
    moment.locale('es');

    this.uploader = new FileUploader({
      url: URL,
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item: any) => {
        console.log(item);

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
  }

  ngOnInit(): void {
    this.contadorTendencias();
    this.crearFormularioModificar();
    const user = localStorage.getItem('token');
    if (user) {
      const { token, identity } = JSON.parse(user);
      this.usuario = identity;
      this.token = token;
      this.rol = identity.rol;
    }
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

  // Validaciones para formulario
  get fecha_inicioModificar() {
    return this.formularioModificar.get('fecha_inicioModificar');
  }

  get hora_inicioModificar() {
    return this.formularioModificar.get('hora_inicioModificar');
  }

  get lugar_reunionModificar() {
    return this.formularioModificar.get('lugar_reunionModificar');
  }

  get medidaModificar() {
    return this.formularioModificar.get('medidaModificar');
  }

  get actor_demandanteModificar() {
    return this.formularioModificar.get('actor_demandanteModificar');
  }

  get demandaModificar() {
    return this.formularioModificar.get('demandaModificar');
  }

  get actor_demandadoModificar() {
    return this.formularioModificar.get('actor_demandadoModificar');
  }

  get situacion_actualModificar() {
    return this.formularioModificar.get('situacion_actualModificar');
  }

  get nivel_tendenciaModificar() {
    return this.formularioModificar.get('nivel_tendenciaModificar');
  }

  get fuenteModificar() {
    return this.formularioModificar.get('fuenteModificar');
  }

  get estadoModificar() {
    return this.formularioModificar.get('estadoModificar');
  }


  /**
   * contadorTendencias
   */
  public contadorTendencias() {
    this.reunionServices.contadorTendencia()
      .subscribe(({ latente, temprano, precrisis, crisis, status }) => {
        if (status === 'success') {
          this.latente = latente;
          this.temprano = temprano;
          this.precrisis = precrisis;
          this.crisis = crisis;
        }
      })
  }

  /**
   * listLatencia
   */
  public listLatencia(latencia: string) {
    this.p = 1;
    localStorage.setItem('position', `${this.p}`)
    const formData = {
      latencia: latencia
    }

    this.reunionServices.buscarTendencia(formData)
      .subscribe(({ tendencia, latencia }) => {
        this.cargando = false;
        const { data, total } = tendencia;
        this.total = total;
        if (data.length != 0) {
          this.latencia = latencia;
          this.tendencia = data;
          this.mostrarTabla = true;
        } else {
          this.mostrarTabla = false;
        }
      })
  }

  /**
  * name
  */
  public mostrarReunion(id: number) {
    this.reunionServices.showReuniones(id)
      .subscribe(({ reunion }) => {
        // console.log(reunion);
        this.reunionMostrar = reunion;
        $('#myModal_historial').modal('hide');
        $('#myModal_mostrar').modal('show');
      });
  }


  /**
 * pageChange(event)  
 */
  public pageChange(event: any) {

    this.cargando = true;
    this.p = event; // numero de página
    const formData = {
      page: this.p,
      latencia: this.latencia
    }

    this.reunionServices.buscarTendencia(formData)
      .subscribe(({ tendencia, latencia }) => {
        this.cargando = false;
        const { data, total } = tendencia;
        this.total = total;
        if (data.length != 0) {
          this.latencia = latencia;
          this.tendencia = data;
          this.mostrarTabla = true;
        } else {
          this.mostrarTabla = false;
        }

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })
  }

  /**
* pageChange(event)  
*/
  public indexPageChange() {

    const indexPagina = localStorage.getItem('position');

    this.cargando = true;
    this.p = Number(indexPagina); // numero de página
    const formData = {
      page: this.p,
      latencia: this.latencia
    }

    this.reunionServices.buscarTendencia(formData)
      .subscribe(({ tendencia, latencia }) => {
        this.cargando = false;
        const { data, total } = tendencia;
        this.total = total;
        if (data.length != 0) {
          this.latencia = latencia;
          this.tendencia = data;
          this.mostrarTabla = true;
        } else {
          this.mostrarTabla = false;
        }

        // Para paginación
        localStorage.setItem('position', `${this.p}`);
        localStorage.setItem('items', `${this.total}`);
      })
  }


  /**
  * imprimirPDF
  */
  public imprimirPDF() {
    $('#myModal_mostrar').modal('hide');
  }

  /**
* MostrarReunionHistorial
*/
  public mostrarReunionHistorial(id: number) {
    this.reunionServices.showReunionesHistorial(id)
      .subscribe(({ reunion }) => {
        this.reunionMostrar = reunion;
        // $('#myModal_historial').modal('hide');
        $('#myModal_mostrar').modal('show');
      });
  }

  /**
* listArchivos
*/
  public listArchivosHistorial(id: number) {
    $('#myModal_archivos_historial').modal('show');
    this.reunionServices.listArchivosHistorial(id)
      .subscribe(({ archivo }) => {
        // console.log(archivo);
        this.listDownload = archivo;
        // console.log(this.listDownload);

      })
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
    this.reunionServices.historial(formData)
      .subscribe(({ history }) => {
        this.historia = history;
      }, err => {
        console.log(err);
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
    this.reunionServices.showReuniones(id)
      .subscribe(({ reunion }) => {
        // console.log(reunion);
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
    this.reunionServices.updateReuniones(datosBody, this.idReunion)
      .subscribe(({ message }) => {

        // // Para mostrar la Busqueda
        // if (this.mostrarReunionHtml) {
        //   this.indexPaginacion();
        // } else {
        //   this.indexPaginacionBuscar();
        // }
        this.contadorTendencias();
        this.indexPageChange();
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
  public extraerBase64 = async ($event: any) => new Promise((resolve, reject): void => {
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
 * listArchivos
 */
  public listArchivos(id: number) {
    $('#myModal_archivos').modal('show');
    this.reunionServices.listArchivos(id)
      .subscribe(({ archivo }) => {
        // console.log(archivo);
        this.listDownload = archivo;
      })
  }


  /**
   * deleteArchivos
   */
  public destroyArchivos(id: number, reuniones_id: number) {
    this.reunionServices.destroyArchivos(id)
      .subscribe(({ message }) => {
        this.toastr.success(message)
        this.listArchivos(reuniones_id);
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
                this.indexPageChange();
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



}
