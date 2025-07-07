//AUTH https://jsmobiledev.com/article/angular-guard

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import firebase from 'firebase/compat/app';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AuthenticationService } from "./authentication.service";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    public ngFireAuth: AngularFireAuth,
    public authService: AuthenticationService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise((resolve, reject) => {
        this.ngFireAuth.onAuthStateChanged((user: firebase.User) => {
          if (user !== null && user.emailVerified !== false) {
            resolve(true);
          } else {
            this.router.navigate(['/menu/login']);
            resolve(false);
          }
        });
      });
  }
  
}
