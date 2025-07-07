import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreevoiceModalPageRoutingModule } from './treevoice-modal-routing.module';

import { TreevoiceModalPage } from './treevoice-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreevoiceModalPageRoutingModule
  ],
  declarations: [TreevoiceModalPage]
})
export class TreevoiceModalPageModule {}
