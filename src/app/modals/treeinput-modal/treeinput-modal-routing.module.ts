import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreeinputModalPage } from './treeinput-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TreeinputModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreeinputModalPageRoutingModule {}
