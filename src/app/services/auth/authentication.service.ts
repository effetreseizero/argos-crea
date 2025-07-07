//https://www.positronx.io/ionic-firebase-authentication-tutorial-with-examples/
import { Injectable, NgZone } from '@angular/core';
import { User } from "../storage/user";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/compat/auth";
//https://github.com/angular/angularfire/blob/master/docs/auth/getting-started.md
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

//ionic storage service
import { CoreStore } from '../storage/core.store';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: any;

  constructor(
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public router: Router,  
    public ngZone: NgZone,
    public coreStore: CoreStore
  ) {
    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.userData = this.coreStore.setUser(user);
        /*
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
        */
      } else {
        this.coreStore.removeUser();
        /*
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
        */
      }
    })
  }

  // Login in with email/password
  SignIn(email, password) {
    //https://stackoverflow.com/questions/61214731/assistance-with-ts2570-error-property-sendemailverification-does-not-exist-on
    return this.ngFireAuth.signInWithEmailAndPassword(email, password)
  }

  // Register user with email/password
  RegisterUser(email, password) {
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password)
  }

  // Email verification when new user register
  SendVerificationMail() {
    return this.ngFireAuth.currentUser.then(u => {
      u.sendEmailVerification()
    }).then(() => {
      this.router.navigate(['/menu/verify-email']);
    })
  }

  // Recover password
  PasswordRecover(passwordResetEmail) {
    return this.ngFireAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email has been sent, please check your inbox.');
    }).catch((error) => {
      window.alert(error)
    })
  }

  // Returns true when user is looged in
  get isLoggedIn(): Promise<boolean> {
    return this.coreStore.getUser().then((user)=>{
      return (user !== null && user.emailVerified !== false) ? true : false;
    });
    
  }

  // Returns true when user's email is verified
  get isEmailVerified(): Promise<boolean>{
    return this.coreStore.getUser().then((user)=>{
      return (user.emailVerified !== false) ? true : false;
    });    
  }

  // Sign in with Gmail
  GoogleAuth() {
    //https://github.com/angular/angularfire/blob/master/docs/auth/getting-started.md
    return this.ngFireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider);
  }

    // Sign-out 
    SignOut() {
      return this.ngFireAuth.signOut().then(() => {
        this.coreStore.removeUser().then((user)=>{
          this.router.navigate(['/menu/home']);    
        });      
      })
    }
  
  /*
  // Auth providers
  AuthLogin(provider) {
    return this.ngFireAuth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['/menu/home']);
        })
      this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  // Store user in localStorage
  SetUserData(user) {
    
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    return userRef.set(userData, {
      merge: true
    })
  }
  */

}