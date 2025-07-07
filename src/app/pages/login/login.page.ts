//https://www.positronx.io/ionic-firebase-authentication-tutorial-with-examples/
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthenticationService } from "../../services/auth/authentication.service";
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    ) { 

  }

  ngOnInit() {
  }

  emailLogin(email, password) {
    this.authService.SignIn(email.value, password.value)
      .then((res) => {
        if(res.user.emailVerified) {
          this.router.navigate(['/menu/home']);          
        } else {
          window.alert('Email is not verified')
          return false;
        }
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  public registration(): void{
    this.router.navigate(['/menu/registration']);
  }

  public googleLogin(): void{
    this.authService.GoogleAuth()
    .then((res) => {
      if(res.user) {
        this.router.navigate(['/menu/home']);          
      } else {
        window.alert('Login failed')
        return false;
      }
    }).catch((error) => {
      window.alert(error.message)
    })
  };

}

