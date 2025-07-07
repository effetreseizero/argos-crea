import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddspecieModalPageRoutingModule } from './addspecie-modal-routing.module';

import { AddspecieModalPage } from './addspecie-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddspecieModalPageRoutingModule
  ],
  declarations: [AddspecieModalPage]
})
export class AddspecieModalPageModule {}
