import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModelsListPageRoutingModule } from './models-list-routing.module';

import { ModelsListPage } from './models-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModelsListPageRoutingModule
  ],
  declarations: [ModelsListPage]
})
export class ModelsListPageModule {}
