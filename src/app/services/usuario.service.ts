import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment } from 'src/environments/environment';
import { LoginForm } from '../interfaces/login-form.interface';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';

const base_url = environment.base_url;
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  public usuario!: Usuario;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  get token(): string{
    return localStorage.getItem('token') || '';
  }

  get uid(): string {
    return this.usuario.uid || '';
  }

  get headers(){
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  googleInit(){
    window.google.accounts.id.initialize({
      client_id: "572001559176-knukpk14d9nka4n40g8mqq14hrcuq07f.apps.googleusercontent.com",
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  async handleCredentialResponse(response: any) {
    this.loginGoogle(response.credential)
    .subscribe(correcto => {
      // Navegar al Dashboard
      this.ngZone.run(() => {
        this.router.navigateByUrl('/');
      });
    })
  }

  logout(){
    localStorage.removeItem('token');
    window.google.accounts.id.disableAutoSelect();
    this.router.navigateByUrl('/login');
  }

  validarToken(): Observable<boolean>{
    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': this.token
      }
    }).pipe(
      map((resp: any) => {
        const { email, google, nombre, role, img = '',  uid} = resp.usuario;
        this.usuario = new Usuario(nombre, email, '', img, google, role, uid);
        localStorage.setItem('token', resp.token);
        return true;
      }),
      catchError(error => of(false))
    );
  }

  crearUusario(formData: RegisterForm){
    return this.http.post(`${base_url}/usuarios`, formData)
  }

  actualizarPerfil(data: {email: string, nombre: string, role: string | undefined}){
    data = {
      ...data,
      role: this.usuario.role
    }
    
    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, this.headers)
  }

  login(formData: LoginForm){
    return this.http.post(`${ base_url }/login`, formData )
    .pipe(
      tap( (resp: any) => {
        localStorage.setItem('token', resp.token )
      })
    );
  }

  loginGoogle(token: any){
    return this.http.post(`${base_url}/login/google`, {token})
    .pipe(
      map((resp: any) => {
        localStorage.setItem('token', resp.token)
      })
    )
  }

  cargarUsuarios(desde: number = 0){
    // localhost:3005/api/usuarios?desde=0
    const url = `${base_url}/usuarios?desde=${desde}`;
    return this.http.get<CargarUsuario>(url, this.headers)
    .pipe(      
      map(resp => {
        const usuarios = resp.usuarios.map(user => new Usuario(user.nombre, user.email, '', user.img, user.google, user.role, user.uid))
        return {
          total: resp.total,
          usuarios
        }
      })
    )
  }

  eliminarUsuario(usuario: Usuario){
    // /usuarios/5eff3c5054f5efec174e9c84
    const url = `${base_url}/usuarios/${usuario.uid}`;
    return this.http.delete(url, this.headers)
  }

  guardarUsuario(usuario: Usuario){
    return this.http.put(`${base_url}/usuarios/${usuario.uid}`, usuario, this.headers)
  }
}
