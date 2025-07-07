import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModelsListPage } from './models-list.page';

const routes: Routes = [
  {
    path: '',
    component: ModelsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelsListPageRoutingModule {}
