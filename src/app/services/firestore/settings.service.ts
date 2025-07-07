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
export class SettingsService {

  user: User = null;

  collectionName = 'settings';

  constructor(
    private firestore: AngularFirestore,
    private coreFacade: CoreFacade
  ) { 
    
    this.user=null;
    this.coreFacade.getUser().subscribe((user)=>{
      if(user){
        this.user=user;
        this.create_settings_document();
      }
    });

    
  }

  ngOnInit() {
    

  }

  create_settings_document(){
    //
    //if settings document not exist create one
    //
    this.firestore.collection(
      this.collectionName,
      //https://stackoverflow.com/questions/49026589/angular-firestore-where-query-returning-error-property-does-not-exist-on
      //.where("userUID", "==", firebase.auth().currentUser.uid)
      ref => ref.where("userUID", "==", this.user.uid)
     )
     .get().toPromise().then(querySnapshot=>{
      if (querySnapshot.empty){
        //('no data found');
        let data = {

          /*
          BLEService cavallettoService("40f6bff1-ab26-4a51-bfeb-b96bf0e1ddca");
          BLEIntCharacteristic distanceChar("40f6bff2-ab26-4a51-bfeb-b96bf0e1ddca", BLERead);
          BLEIntCharacteristic contatoreChar("40f6bff3-ab26-4a51-bfeb-b96bf0e1ddca", BLERead);
          BLEBooleanCharacteristic booleanChar("40f6bff4-ab26-4a51-bfeb-b96bf0e1ddca", BLERead | BLEWrite);
          BLEIntCharacteristic batteryChar("40f6bff5-ab26-4a51-bfeb-b96bf0e1ddca", BLERead);
          BLEIntCharacteristic specieChar("40f6bff6-ab26-4a51-bfeb-b96bf0e1ddca", BLERead);  // CHECK
          BLEIntCharacteristic maxspecieChar("40f6bff7-ab26-4a51-bfeb-b96bf0e1ddca", BLEWrite);
          distanceChar = Diametro
          */

          //0000fff0-0000-1000-8000-00805f9b34fb

          userUID:this.user.uid,
          deleted:false,
          caliper_btle_service:"40f6bff1-ab26-4a51-bfeb-b96bf0e1ddca",
          caliper_btle_diameter_charact:"40f6bff2-ab26-4a51-bfeb-b96bf0e1ddca",
          caliper_btle_diameter_decode: "Int8",
          caliper_btle_diameter_offset: 0,
          caliper_btle_diameter_endian: "true",
          caliper_btle_counter_charact:"40f6bff3-ab26-4a51-bfeb-b96bf0e1ddca",
          caliper_btle_counter_decode: "Int8",
          caliper_btle_counter_offset: 0,
          caliper_btle_counter_endian: "true",
          caliper_btle_maxspecie_charact:"40f6bff7-ab26-4a51-bfeb-b96bf0e1ddca",
          caliper_btle_maxspecie_decode: "Int8",
          caliper_btle_maxspecie_offset: 0,
          caliper_btle_maxspecie_endian: "true",
          caliper_btle_specie_charact:"40f6bff6-ab26-4a51-bfeb-b96bf0e1ddca",
          caliper_btle_specie_decode: "Int8",
          caliper_btle_specie_offset: 0,
          caliper_btle_specie_endian: "true",
          gps_random_error:false,
          caliper_random_data:false,
        }
        this.firestore.collection(this.collectionName).doc(this.user.uid).set(data);
      } else if (querySnapshot.size > 1) {
        //console.log('no unique data');
      } else {
        //console.log('unique data');
      };
     });
  }

  read_settings_document() { 
    return this.firestore.doc(this.collectionName + '/' + this.user.uid).snapshotChanges();
  }

  update_settings_document(data):Promise<void> {
    return this.firestore.doc(this.collectionName + '/' + this.user.uid).update(data);
  }
}
