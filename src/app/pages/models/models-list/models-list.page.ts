import { Component, OnInit } from '@angular/core';

import { CoreFacade} from '../../../services/storage/core.facade';
import { Observable } from 'rxjs';

import { Router, NavigationExtras } from '@angular/router';

import { AuthenticationService } from "../../../services/auth/authentication.service";

import { ModelsService} from '../../../services/firestore/models.service';

import { AlertController } from '@ionic/angular';

import { User } from 'src/app/services/storage/user';


@Component({
  selector: 'app-models-list',
  templateUrl: './models-list.page.html',
  styleUrls: ['./models-list.page.scss'],
})
export class ModelsListPage implements OnInit {

  modelsList = [];
  user:User;


  constructor(
    private router: Router,
    public authService: AuthenticationService,
    public modelsService: ModelsService,
    public alertController: AlertController,
    private coreFacade: CoreFacade,
  ) { }

  ngOnInit() {
    
    this.coreFacade.getUser().subscribe((user)=>{
      this.user=user;
      this.modelsList.splice(0);
      this.loadModels();
    });
  }

  async loadModels(){
    this.modelsService.read_models_collection().subscribe(data => {
      this.modelsList = data.map(e => {

        let model = {};
        //add id of syrvey
        model["id"]=e.payload.doc.id;
        model["isEdit"]= false;
        //add all other properties
        for (let key of Object.keys(e.payload.doc.data())){
          model[key] = e.payload.doc.data()[key];
        }

        //https://stackoverflow.com/questions/2388115/get-locale-short-date-format-using-javascript/31663241
        var date = new Date(model["createdTime"]);
        var options = {
            year: "numeric",
            month: "2-digit",
            day: "numeric",
            hour: "numeric",
            minute:"numeric"
        };
        model["short_date"] =  date.toLocaleDateString("it") //en is language option, you may specify..
        return model;
      })
      .sort(
        (itemA, itemB) => {
          return itemB["createdTime"] - itemA["createdTime"];
        }
      );

    });
  }

  activeModels(){
    return this.modelsList.filter(x => x.deleted != true);
  }
  
  async createModel() {
    const alert = await this.alertController.create({
      header: 'Crea',
      inputs: [
        {name: 'name',type: 'text',placeholder: 'Nome'}
      ],
      buttons: [
        {text: 'Cancel',role: 'cancel',cssClass: 'secondary',handler: () => {console.log('Confirm Cancel');}
        },
        {
          text: 'Ok',
          handler: (data) => {
            if (data.name.length>0) {
              this.modelsService.create_model_document(data).then(resp => {
                this.editModel(resp);
              })
              .catch(error => {
                console.log(error);
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async duplicateModel(recordID){
    this.modelsService.read_model_document(recordID).subscribe((data)=>{
      let model = data.payload.data();
      model["name"] = "Copia " + model["name"];
      this.modelsService.create_model_document(model).then(resp => {
        this.editModel(resp);
      })
      .catch(error => {
        console.log(error);
      });
    })
  }

  async deleteModel(recordID) {
    const alert = await this.alertController.create({
      header: 'Sei sicuro?',
      inputs: [
      ],
      buttons: [
        {text: 'Annulla',role: 'cancel',cssClass: 'secondary',handler: () => {console.log('Annulla');}
        },
        {
          text: 'Ok',
          handler: () => {
            this.modelsService.delete_model_document(recordID);
          }
        }
      ]
    });
    await alert.present();
  }

  editModel(record){
    //https://ionicacademy.com/pass-data-angular-router-ionic-4/
    let navigationExtras: NavigationExtras = {
      state: {
        id: record.id 
      }
    };
      this.router.navigate(['/menu/models/model-edit'],navigationExtras);
  }


}
