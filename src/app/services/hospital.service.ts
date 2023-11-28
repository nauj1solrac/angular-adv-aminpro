import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Hospital } from '../models/hospital.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  constructor(
    private http: HttpClient
  ){}

  get token(): string{
    return localStorage.getItem('token') || '';
  }

  get headers(){
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  cargarHospitales(){
    // localhost:3005/api/hospitales
    const url = `${base_url}/hospitales`;
    return this.http.get<{ok: boolean, hospitales: Hospital[]}>(url, this.headers)    
    .pipe(
      map((resp: {ok: boolean, hospitales: Hospital[]}) => resp.hospitales)
    )
  }

  crearHospital(nombre: string){
    // localhost:3005/api/hospitales
    const url = `${base_url}/hospitales`;
    return this.http.post<{ok: boolean, hospitales: Hospital[]}>(url, {nombre}, this.headers)
  }
  
  actualizarHospitales(_id: string, nombre: string){
    // localhost:3005/api/hospitales
    const url = `${base_url}/hospitales/${_id}`;
    return this.http.put<{ok: boolean, hospitales: Hospital[]}>(url, {nombre}, this.headers)
  }
  
  borrarHospitales(_id: string){
    // localhost:3005/api/hospitales
    const url = `${base_url}/hospitales/${_id}`;
    return this.http.delete<{ok: boolean, hospitales: Hospital[]}>(url, this.headers)
  }
}
