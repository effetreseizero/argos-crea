import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyEditPageRoutingModule } from './survey-edit-routing.module';

import { SurveyEditPage } from './survey-edit.page';

//https://medium.com/runic-software/a-simple-guide-to-openlayers-in-angular-b10f6feb3df1
import {OlMapComponent} from '../../components/ol-map/ol-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SurveyEditPageRoutingModule,
  ],
  declarations: [
    SurveyEditPage,
    OlMapComponent
  ]
})
export class SurveyEditPageModule {}
