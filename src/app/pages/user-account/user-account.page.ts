import { Component, OnInit } from '@angular/core';

import { Router } from "@angular/router";

import { AuthenticationService } from "../../services/auth/authentication.service";

import { CoreFacade } from "../../services/storage/core.facade";
import { User } from 'src/app/services/storage/user';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.page.html',
  styleUrls: ['./user-account.page.scss'],
})
export class UserAccountPage implements OnInit {

  user: User;

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    private coreFacade: CoreFacade, 
  ) {

  }

  ngOnInit() {

    this.user=null;
    this.coreFacade.getUser().subscribe((user)=>{
      this.user=user;
    });

  }

  public logout(){
    this.authService.SignOut();
  }

}
