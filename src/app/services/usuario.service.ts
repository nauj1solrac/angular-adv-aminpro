import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment } from 'src/environments/environment';
import { LoginForm } from '../interfaces/login-form.interface';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

const base_url = environment.base_url;
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

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
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }
    }).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token)
      }),
      map(resp => true),
      catchError(error => of(false))
    );
  }

  crearUusario(formData: RegisterForm){
    return this.http.post(`${base_url}/usuarios`, formData)
  }

  login(formData: LoginForm){
    if(formData.remember){
      localStorage.setItem('email', formData.email);
    }else{
      localStorage.removeItem('email')
    }
    return this.http.post(`${base_url}/login`, formData)
    .pipe(
      map((resp: any) => {
        localStorage.setItem('id', resp.id);
        localStorage.setItem('token', resp.token);
        localStorage.setItem('usuario', JSON.stringify(resp.usuario));
        return true;
      })
    )
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
