import { Component, OnInit } from '@angular/core';

// Para utilizar formularios reactivos
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Motras ntificaciones en tarjetas
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

// Para navegar de una pagina a otra
import { Router, ActivatedRoute, Params } from '@angular/router';

// Servicios
import { UsuariosService } from 'src/app/services/usuarios.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public formSubmitted = false;

  public cargando = false;

  // Formularios
  public formulario!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioServices: UsuariosService,
    private toastr: ToastrService,
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void { }

  /**
   * crearFormulario
   */
  public crearFormulario() {
    this.formulario = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    })
  }

  /**
   * login de Usuarios
   */
  public login() {

    // Spinner de ingresando al sistema
    this.cargando = true;
    // console.log(this.formulario.value);


    this.usuarioServices.login(this.formulario.value)
      .subscribe(resp => {
        this.cargando = false;
        if ((resp.status === 'success') && (resp.identity.estado === 1)) {
          this.router.navigateByUrl('/home');

          // remember
          if (this.formulario.get('remember')?.value) {
            localStorage.setItem('usuario', this.formulario.get('usuario')?.value)
          } else {
            localStorage.removeItem('usuario');
          }

          this.toastr.success(`${resp.identity.nombres} ${resp.identity.apellidos}`, 'Bienvenid@');

        } else {
          this.cargando = false;
          Swal.fire({
            icon: 'error',
            title: 'Credenciales Incorrectas..!',
            text: 'Vuelva a intentarlo!',
            footer: 'Gobierno Autónomo Departamental de Cochabamba'
          })
        }

      }, (err) => {
        this.cargando = false;
        console.log(err);
        Swal.fire('Error', err.error.message, 'error')
      });
  }

  // Validaciones para formulario
  get usuario() {
    return this.formulario.get('usuario');
  }
  get password() {
    return this.formulario.get('password');
  }
  get remember() {
    return this.formulario.get('remember');
  }

}
