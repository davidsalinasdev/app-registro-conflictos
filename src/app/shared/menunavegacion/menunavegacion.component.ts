import { Component, OnInit } from '@angular/core';

// Formularios Reactivos
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

// Para navegar de una pagina a otra
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuariosService } from 'src/app/services/usuarios.service';

// Motras ntificaciones en tarjetas
import Swal from 'sweetalert2';

// Utilizando jquery
declare var JQuery: any;
declare var $: any;

@Component({
  selector: 'app-menunavegacion',
  templateUrl: './menunavegacion.component.html',
  styleUrls: ['./menunavegacion.component.css']
})
export class MenunavegacionComponent implements OnInit {

  public usuario: any;
  public token: any;
  public rol: any;

  // Formularios reactivos
  public formulario!: FormGroup;

  // Para deshabilitar el boton de guardar
  public btnSave: boolean = true;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioServices: UsuariosService,
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    const user = localStorage.getItem('token');
    if (user) {
      const { token, identity } = JSON.parse(user);
      this.usuario = identity;
      this.token = token;
      this.rol = identity.rol;
    }
  }


  /**
   * logout
   */
  public logout() {

    localStorage.removeItem('token');

    this.usuario = null;
    this.token = null;

    // Redireccionar al la pagina principal
    this.router.navigate(['/login']);
    localStorage.removeItem('position');
    localStorage.removeItem('items');
    localStorage.removeItem('positionBuscar');
    localStorage.removeItem('fechaFin');
    localStorage.removeItem('itemsBuscar');
    localStorage.removeItem('fechaInicio');
    localStorage.removeItem('positionFecha');

  }

  /**
  * crearFormulario
  */
  public crearFormulario() {
    this.formulario = this.fb.group({
      actualPassword: ['', Validators.compose([Validators.required])],
      nuevoPassword: ['', Validators.compose([Validators.required, Validators.pattern(/^.{4,}$/)])]
    });
  }

  get actualPassword() {
    return this.formulario.get('actualPassword');
  }

  get nuevoPassword() {
    return this.formulario.get('nuevoPassword');
  }

  /**
    * submit
    */
  public submit() {

    let usuarioActual: any;
    const infoToken = localStorage.getItem('token');
    if (infoToken) {
      const { identity } = JSON.parse(infoToken);
      usuarioActual = identity;
    }

    const formData = {
      usuario: usuarioActual.usuario,
      password: this.formulario.value.actualPassword,
      idUsuario: usuarioActual.sub
    }

    this.btnSave = false;
    this.usuarioServices.loginChangesPassword(formData)
      .subscribe(({ status }) => {
        if (status === 'success') {

          Swal.fire({
            title: 'Esta seguro de cambiar su contraseña?',
            text: `Si esta de acuerdo debe iniciar sesión nuevamente`,
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'Cancelar!',
            confirmButtonText: 'Si, cambiar'
          }).then((result) => {
            if (result.isConfirmed) {

              const formData2 = {
                usuario: usuarioActual.usuario,
                password: this.formulario.value.nuevoPassword,
                idUsuario: usuarioActual.sub
              }

              this.usuarioServices.updateChangesPassword(formData2)
                .subscribe(resp => {
                  $('#myModal_changes_pass').modal('hide');
                  localStorage.removeItem('position');
                  localStorage.removeItem('items');
                  localStorage.removeItem('token');
                  this.router.navigateByUrl('/login');
                  Swal.fire(
                    'La contraseña se cambio correctamente!',
                    'Inicie sesión nuevamente',
                    'success'
                  )
                });
            }
          })


        } else {
          Swal.fire('Error', 'La contraseña actual es incorrecta..', 'error')
        }

      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.message, 'error')
        this.btnSave = true;
      }, () => {
        this.btnSave = true;
      });
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

}
