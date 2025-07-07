import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreeinputModalPageRoutingModule } from './treeinput-modal-routing.module';

import { TreeinputModalPage } from './treeinput-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreeinputModalPageRoutingModule
  ],
  declarations: [TreeinputModalPage]
})
export class TreeinputModalPageModule {}
