// https://medium.com/@OlegVaraksin/how-to-make-ionic-storage-reactive-acdd8996f1e6

import { CoreState } from './core.state';
import { Store } from './abstract.store';
import { Injectable } from '@angular/core';

//https://capacitorjs.com/docs/guides/storage
import { Storage } from '@capacitor/storage';

import {User} from './user';

@Injectable({
  providedIn: 'root'
})
export class CoreStore extends Store<CoreState> {

  private readonly _prefix: string;
  
  private readonly USER = 'user';
  private readonly USER_INIT = null;
  public ready$: Promise<any[]>;

  constructor() {
    super(new CoreState());
    this._prefix = 'argos360';

    // read initial values from storage
    this.ready$ = Promise.all([
      this.initValue(this.USER)
    ]);
  }

  public getUser(): Promise<User> {
    return this.readValue(this.USER);
  }

  public setUser(value: User): Promise<any> {
    return this.setValue(this.USER, value);
  }

  public removeUser(): Promise<any> {
    return this.removeValue(this.USER);
  }

  private initValue(prop: keyof CoreState): Promise<any> {
  
    const keyval = `${this._prefix}-${prop}`;
    return Storage.get({key:keyval}).then(record => {
      //record.value poichè leggo dallo Storage
      this.setStateValue(prop, JSON.parse(record.value));
      return record;
    }).catch(_ => {
      this.setStateValue(prop, undefined);
      return undefined;
    });
  }

  private setValue(prop: keyof CoreState, value: any): Promise<any> {
    //solo value perchè arriva da form
    this.setStateValue(prop, value);
    const keyval = `${this._prefix}-${prop}`;
    return Storage.set({key: keyval,value: JSON.stringify(value)});
  }

  private readValue(prop: keyof CoreState): Promise<any> {
    const keyval = `${this._prefix}-${prop}`;
    return Storage.get({key: keyval}).then((record)=>{
      
      return JSON.parse(record.value);
    });
  }

  private removeValue(prop: keyof CoreState): Promise<any> {
    this.setStateValue(prop, undefined);
    const keyval = `${this._prefix}-${prop}`;
    return Storage.remove({key: keyval});
  }
  
  private setStateValue(prop: keyof CoreState, value: any): void {
    this.state = {
      ...this.state,
      [prop]: value
    };
  }
}