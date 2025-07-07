import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModelEditPageRoutingModule } from './model-edit-routing.module';

import { ModelEditPage } from './model-edit.page';

import { MathjaxModule } from 'mathjax-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModelEditPageRoutingModule,
    MathjaxModule.forChild()
  ],
  declarations: [ModelEditPage]
})
export class ModelEditPageModule {}
