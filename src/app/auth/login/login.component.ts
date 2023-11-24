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
  public email!: string;
  public recuerdame: boolean = false;

  public formSubmitted = false;

  public loginForm = this.fb.group({
    email: ['test100@gmail.com', [ Validators.required, Validators.email ] ],
    password: ['123456', Validators.required ],
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
    .subscribe(correcto => this.router.navigate(['/dashboard']))
  }
}
