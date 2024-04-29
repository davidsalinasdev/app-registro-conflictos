import { Component, OnInit } from '@angular/core';

// Formularios
import { FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';

// Servicios
import { ReunionesService } from 'src/app/services/reuniones.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

// Modelos
import { Reunion } from 'src/app/models/reunion.model';

// Alertas
import { ToastrService } from 'ngx-toastr';

// Motras ntificaciones en tarjetas
import Swal from 'sweetalert2';


// Utilizando jquery
declare var JQuery: any;
declare var $: any;

@Component({
  selector: 'app-rangofecha',
  templateUrl: './rangofecha.component.html',
  styleUrls: ['./rangofecha.component.css']
})
export class RangofechaComponent implements OnInit {
  // Formularios reactivos
  public formulario!: FormGroup;

  // loading
  public cargando: boolean = true;

  // Lista de todas reuniones
  public reuniones: any[] = [];

  public reunionMostrar?: Reunion;

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
      fechainicio: ['', [Validators.required]],
      fechafin: ['', [Validators.required]],
    });
  }

  /**
   * submit
   */
  public submit() {
    this.cargando = true;

    const formData = {
      fechainicio: new Date(this.formulario.value.fechainicio).toLocaleDateString(),
      fechafin: new Date(this.formulario.value.fechafin).toLocaleDateString(),
    }

    console.log(formData);


    this.reunionesServices.buscarReunionesFechas(formData)
      .subscribe(({ status, reuniones }) => {
        this.cargando = false;
        // console.log(status);
        // console.log(reuniones);
        this.reuniones = reuniones;
        this.toastr.success('Reunión encontrada', 'Sistema de conflictos');
      }, (err) => {
        Swal.fire('Error', err.error.message, 'error')
      });

  }

  // Validaciones para formulario
  get fechainicio() {
    return this.formulario.get('fechainicio');
  }

  get fechafin() {
    return this.formulario.get('fechafin');
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


  }

}

