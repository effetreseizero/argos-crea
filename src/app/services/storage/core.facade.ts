// https://medium.com/@OlegVaraksin/how-to-make-ionic-storage-reactive-acdd8996f1e6

import { CoreState } from './core.state';
import { CoreStore } from './core.store';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {User} from './user';

@Injectable({
    providedIn: 'root'
})
export class CoreFacade {
    
  constructor(private _store: CoreStore) { }

  public getUser(): Observable<User> {
    return this._store.select(x=>x.user);
  }

  public setUser(user:User): void{
    this._store.setUser(user);
  }

}