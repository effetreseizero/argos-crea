// firebase.service.ts
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
export class SurveysService {

  user: User = null;

  collectionName = 'surveys';
  subcollectionName = 'trees';

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
  read_surveys_collection() {
    return this.firestore.collection(
      this.collectionName,
      //https://stackoverflow.com/questions/49026589/angular-firestore-where-query-returning-error-property-does-not-exist-on
      //.where("userUID", "==", firebase.auth().currentUser.uid)
       ref => ref.where("userUID", "==", this.user.uid)
      )
      .snapshotChanges();
      
  }

  create_survey_document(data) {
    data['userUID']=this.user.uid;
    data['deleted']=false;
    //https://www.nuomiphp.com/eplan/en/2152.html
    data['createdTime']=Date.now();
    return this.firestore.collection(this.collectionName).add(data);
  }

  read_surveys_document(surveyID) {
    return this.firestore.doc(this.collectionName + '/' + surveyID).snapshotChanges();
  }

  update_surveys_document(surveyID, data) {
    this.firestore.doc(this.collectionName + '/' + surveyID).update(data);
  }

  delete_surveys_document(surveyID) {
    //https://www.nuomiphp.com/eplan/en/2152.html
    let data =
    {
      deleted: true,
      deletedTime: Date.now()

    }
    this.firestore.doc(this.collectionName + '/' + surveyID).update(data);
    
  }

  /*
  TREES SUBCOLLECTION
  

  //https://www.freakyjolly.com/ionic-firebase-crud-operations/#.X-mQOulKiEI
  read_trees_subcollection(surveyID) {
    console.log("fsurveysService.read_trees_subcollection")
    return this.firestore.collection(
      this.collectionName+'/'+surveyID+'/'+this.subcollectionName,
      //https://stackoverflow.com/questions/49026589/angular-firestore-where-query-returning-error-property-does-not-exist-on
      //.where("userUID", "==", firebase.auth().currentUser.uid)
      ref => ref.where("userUID", "==", this.user.uid)
      )
      .snapshotChanges();
  }

  create_tree_document(surveyID,data) {
    data['userUID']=this.user.uid;
    data['createdTime']=Date.now();
    return this.firestore.collection(this.collectionName+'/'+surveyID+'/'+this.subcollectionName).add(data);
  }

  

  update_tree_document(surveyID,treeID, data) {
    this.firestore.collection(this.collectionName+'/'+surveyID+'/'+this.subcollectionName).doc(treeID).update(data);
  }

  // https://stackoverflow.com/questions/48708640/delete-a-document-from-subcollection-in-firestore-with-node-js
  delete_tree_document(surveyID,treeID) {
    this.firestore.collection(this.collectionName+'/'+surveyID+'/'+this.subcollectionName).doc(treeID).delete();
    
  }
  */
}