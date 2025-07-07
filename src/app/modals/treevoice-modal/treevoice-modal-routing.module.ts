import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreevoiceModalPage } from './treevoice-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TreevoiceModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreevoiceModalPageRoutingModule {}
