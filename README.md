# Sistema de registro de reuniones

# Paso 1: Configurar angular para nuevo proyecto

1. Cargar todos los archivos dentro de assets

# Paso 2: Crear la carpeta AUTH de autenticación con su routing y modulo

1. Comando: ng g m auth/auth --routing --flat

# Paso 3: Generar los componentes login y register

1. Comando: ng g c auth/login --skip-tests --module auth
2. Comando: ng g c auth/register --skip-tests --module auth

# Paso 4: Configuramos las rutas principales de auth

const routes: Routes = [
/**** Rutas PUBLICAS Principales como hijas de app-routing.module.ts****/
{ path: 'login', component: LoginComponent, data: { titulo: 'Login' } },
{ path: 'register', component: RegisterComponent },
];

# Paso 5: Crear componentes NopagesFoundComponent en la Raiz(app.module)

1. comando: ng g c nopagescomponent --skip-tests --module app

2. Configurando Nopagesfoundcomponenet en app-routing.module.ts
3. Declarar todos los modulos secundarios en app.module.ts
4. Declara todas las rutas secundarias en el app-routing.module.ts

# Psao 6: Configurar el app-componet.html

<!-- Aqui se esta renderizando todas las rutas principales -->
<!--
    nopagesfound
    login
    register
 -->

<router-outlet></router-outlet>

# Paso 7: Crear el componente PAGES en la Raiz del proyecto con su rutas y modulo

1. ng g m pages/pages --routing --flat
2. Crear el componente pages donde va a funcionar el pages-routing.ts
3. ng g c pages --skip-tests --module pages
4.

# Paso 8: Crear La carpeta SHARED que sera compartida en toda la app con su modulo

1. ng g m shared/shared --flat
2. Importar el shared.module.ts a pages.module.ts

# Paso 8: Importar el pages.module.ts a app.module.ts para su uso en la aplicacion

# paso 9: configuración del pages-routing.module.ts

// Rutas PROTEGIDAS como hijas de app-routing.module.ts
{
// Cuando el path sea vacio va redireciones aun sub moduloComonenete
path: 'dashboard', // ruta padre
component: PagesComponent,
// Definiendo rutas hijas de este modulo
children: [ // ruta hija depende del padre
{ path: '', component: DashboardComponent }, // Path inicial
{ path: 'progress', component: ProgressComponent },
{ path: 'grafica1', component: Grafica1Component },
// { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
]
},

# Paso 10: Para instalar paquetes plugins de angular

npm config set legacy-peer-deps true
