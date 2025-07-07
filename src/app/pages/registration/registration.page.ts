//https://www.positronx.io/ionic-firebase-authentication-tutorial-with-examples/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from "../../services/auth/authentication.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public authService: AuthenticationService
    ) { }

  ngOnInit() {
  }

  signUp(email, password){
    this.authService.RegisterUser(email.value, password.value)
    .then((res) => {
      // Do something here
      this.authService.SendVerificationMail()
    }).catch((error) => {
      window.alert(error.message)
    })
  }

}


