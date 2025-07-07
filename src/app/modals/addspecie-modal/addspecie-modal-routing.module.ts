import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddspecieModalPage } from './addspecie-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddspecieModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddspecieModalPageRoutingModule {}
