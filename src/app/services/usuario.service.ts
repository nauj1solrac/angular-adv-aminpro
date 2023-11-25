import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment } from 'src/environments/environment';
import { LoginForm } from '../interfaces/login-form.interface';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';

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

    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, {
      headers: {
        'x-token': this.token
      }
    })
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
}
