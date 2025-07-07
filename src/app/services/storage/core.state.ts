//https://medium.com/@OlegVaraksin/how-to-make-ionic-storage-reactive-acdd8996f1e6
import {User} from './user';


export class CoreState {

    public readonly user: User;
  
    constructor() {
      // set initial state
      this.user = null;
    }
}