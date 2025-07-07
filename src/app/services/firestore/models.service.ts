import { Injectable } from '@angular/core';

//https://www.freakyjolly.com/ionic-firebase-crud-operations/#.X-mQOulKiEI
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { CoreFacade } from "../storage/core.facade";
import { User } from 'src/app/services/storage/user';

import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { TimeoutError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ModelsService {

  user: User = null;

  collectionName = 'models';

  constructor(
    private firestore: AngularFirestore,
    private coreFacade: CoreFacade
  ) { 
    
    this.user=null;
    this.coreFacade.getUser().subscribe((user)=>{
      this.user=user;
    });
  }

  ngOnInit() {
    

  }

  //https://www.freakyjolly.com/ionic-firebase-crud-operations/#.X-mQOulKiEI
  read_models_collection() {
    return this.firestore.collection(
      this.collectionName,
      //https://stackoverflow.com/questions/49026589/angular-firestore-where-query-returning-error-property-does-not-exist-on
      //.where("userUID", "==", firebase.auth().currentUser.uid)
       ref => ref.where("userUID", "==", this.user.uid)
      )
      .snapshotChanges();
      
  }

  create_model_document(data) {
    data['userUID']=this.user.uid;
    data['deleted']=false;
    //https://www.nuomiphp.com/eplan/en/2152.html
    data['createdTime']=Date.now();
    return this.firestore.collection(this.collectionName).add(data);
  }

  read_model_document(modelID) {
    return this.firestore.doc(this.collectionName + '/' + modelID).snapshotChanges();
  }

  update_model_document(modelID, data) {
    this.firestore.doc(this.collectionName + '/' + modelID).update(data);
  }

  delete_model_document(modelID) {
    //https://www.nuomiphp.com/eplan/en/2152.html
    let data =
    {
      deleted: true,
      deletedTime: Date.now()

    }
    this.firestore.doc(this.collectionName + '/' + modelID).update(data);
    
  }
}
