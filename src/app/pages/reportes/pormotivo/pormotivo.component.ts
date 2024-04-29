import { Component, OnInit } from '@angular/core';

// Formularios
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Servicios
import { ReunionesService } from 'src/app/services/reuniones.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

// Modelos
import { Reunion } from 'src/app/models/reunion.model';

// Motras ntificaciones en tarjetas
import Swal from 'sweetalert2';

import { ToastrService } from 'ngx-toastr';


// Utilizando jquery
declare var JQuery: any;
declare var $: any;

// Manejo de fechas
import * as moment from 'moment';

@Component({
  selector: 'app-pormotivo',
  templateUrl: './pormotivo.component.html',
  styleUrls: ['./pormotivo.component.css']
})
export class PormotivoComponent implements OnInit {
  // Formularios reactivos
  public formulario!: FormGroup;
  public formularioModificar!: FormGroup;

  // loading
  public cargando: boolean = true;

  public idReunion: number = 0;

  // Lista de todas reuniones
  public reuniones: any[] = [];

  public reunionMostrar?: Reunion;

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

  constructor(
    private fb: FormBuilder,
    private usuarioServices: UsuariosService,
    private reunionesServices: ReunionesService,
    private toastr: ToastrService,
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    this.indexReuniones();
  }

  /**
 * crearFormulario
 */
  public crearFormulario() {
    this.formulario = this.fb.group({
      motivo: ['', [Validators.required]],
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
      fuenteModificar: ['', [Validators.required]],
      estadoModificar: ['', [Validators.required]],
    });
  }

  /**
   * submit
   */
  public submit() {
    this.cargando = true;

    this.reunionesServices.buscarReuniones(this.formulario.value)
      .subscribe(({ reuniones }) => {
        this.cargando = false;
        console.log(reuniones);
        this.reuniones = reuniones;
        this.toastr.success('Reunión encontrada', 'Sistema de conflictos');
      })
  }

  // Validaciones para formulario
  get motivo() {
    return this.formulario.get('motivo');
  }

  /**
  * indexReuniones
  */
  public indexReuniones() {
    this.cargando = true;
    this.usuarioServices.indexUsuarios()
      .subscribe(({ reuniones }) => {
        // console.log(reuniones);
        this.reuniones = reuniones.data;
        this.cargando = false;
      })
  }


  /**
  * name
  */
  public mostrarReunion(id: number) {

    this.reunionesServices.showReuniones(id)
      .subscribe(({ reunion }) => {
        console.log(reunion);
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
  * limpiar
  */
  public limpiar() {
    this.formulario.reset();
  }


  /**
  * modificarReunion
  */
  public modificarReunion(id: number) {

    let fecha: string = '';

    this.idReunion = id;

    this.reunionesServices.showReuniones(id)
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
  * destroyPersona
  */
  public destroyReunion(id: number, motivo: string) {


    Swal.fire({
      title: 'Esta Seguro de Eliminar?',
      text: `Esta a punto de eliminar la reunión con motivo: ${motivo}`,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar!',
      confirmButtonText: 'Si, dar de Baja!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioServices.destroyPersona(id)
          .subscribe(({ status, message }) => {
            if (status === 'success') {
              this.indexReuniones();
              Swal.fire(
                'Reunión dado de Baja!',
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

  /**
  * pageChange(event)  */
  public pageChange(event: any) {

    this.cargando = true;
    this.p = event;
    const formData = {
      page: this.p
    }
    this.reunionesServices.indexReunionesPaginacion(formData)
      .subscribe(({ reuniones }) => {
        // console.log(reuniones);
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

}

