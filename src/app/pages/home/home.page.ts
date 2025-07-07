import { Component } from '@angular/core';
import { CoreFacade} from '../../services/storage/core.facade';
import { Observable } from 'rxjs';

import { Router, NavigationExtras } from '@angular/router';

import { AuthenticationService } from "../../services/auth/authentication.service";
import { SettingsService} from "../../services/firestore/settings.service"

import { SurveysService} from '../../services/firestore/surveys.service';

import { AlertController } from '@ionic/angular';

import { User } from 'src/app/services/storage/user';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  surveyList = [];
  user:User;

  constructor(
    private router: Router,
    public authService: AuthenticationService,
    public surveysService: SurveysService,
    public alertController: AlertController,
    private coreFacade: CoreFacade,
    //create default settings document if not exist
    private settingsService:SettingsService
  ) {
  }

  ngOnInit() {
    this.coreFacade.getUser().subscribe((user)=>{
        if(user){
          this.user=user;
          this.loadSurveys();
        }
    });
  }

  public logIn(): void{
    if(!this.authService.isLoggedIn){
      this.router.navigate(['/menu/login']);
    }else{
      this.router.navigate(['/menu/user-account']);
    }
  }

  async loadSurveys(){
    this.surveysService.read_surveys_collection().subscribe(data => {
      this.surveyList = data.map(e => {

        let survey = {};
        //add id of syrvey
        survey["id"]=e.payload.doc.id;
        survey["isEdit"]= false;
        //add all other properties
        for (let key of Object.keys(e.payload.doc.data())){
          survey[key] = e.payload.doc.data()[key];
        }

        //https://stackoverflow.com/questions/2388115/get-locale-short-date-format-using-javascript/31663241
        var date = new Date(survey["createdTime"]);
        var options = {
            year: "numeric",
            month: "2-digit",
            day: "numeric",
            hour: "numeric",
            minute:"numeric"
        };
        survey["short_date"] =  date.toLocaleDateString("it") //en is language option, you may specify..
        return survey;
      })
      .sort(
        (itemA, itemB) => {
          return itemB["createdTime"] - itemA["createdTime"];
        }
      );

    });
  }

  async createSurvey() {
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
              this.surveysService.create_survey_document(data).then(resp => {
                this.editSurvey(resp);
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

  async deleteSurvey(recordID) {
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
            this.surveysService.delete_surveys_document(recordID);
          }
        }
      ]
    });
    await alert.present();
  }

  editSurvey(record){
    //https://ionicacademy.com/pass-data-angular-router-ionic-4/
    let navigationExtras: NavigationExtras = {
      state: {
        id: record.id 
      }
    };
      this.router.navigate(['/menu/survey-edit'],navigationExtras);
  }

  activeSurveys(){
    return this.surveyList.filter(x => x.deleted == false);
  }

}


