import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

declare const window: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  public formSubmitted = false;

  public loginForm = this.fb.group({
    email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
    password: ['', Validators.required ],
    remember: [false]
  },{
    email: String,
    password: String,
    remember: Boolean
  });

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ){}

  ngOnInit(): void {
    this.renderButton();
  }

  renderButton(){
    this.startApp();

    window.google.accounts.id.renderButton(
      document.getElementById("google-button"),
      {
        theme: "outline",
        size: "large"
      }
    );
  }

  async startApp(){
    await this.usuarioService.googleInit();
  }

  login(){
    this.usuarioService.login(this.loginForm.value)
    .subscribe(correcto => {
      if(this.loginForm.get('remember')?.value){
        localStorage.setItem('email', this.loginForm.get('email')?.value)
      }else{
        localStorage.removeItem('email');
      }
      this.router.navigateByUrl('/');
    }, (err) => {
      Swal.fire('Error', err.error.msg, 'error')
    })
  }
}
