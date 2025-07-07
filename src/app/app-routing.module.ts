import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //https://www.positronx.io/add-dynamic-side-menu-in-ionic-with-active-class/
  {
    path: '',
    loadChildren: () => import('./menu/menu.module').then(m => m.MenuPageModule) 
  },
  {
    path: 'treevoice-modal',
    loadChildren: () => import('./modals/treevoice-modal/treevoice-modal.module').then( m => m.TreevoiceModalPageModule)
  },
  {
    path: 'models-list',
    loadChildren: () => import('./pages/models/models-list/models-list.module').then( m => m.ModelsListPageModule)
  },
  {
    path: 'model-edit',
    loadChildren: () => import('./pages/models/model-edit/model-edit.module').then( m => m.ModelEditPageModule)
  },
  {
    path: 'addspecie-modal',
    loadChildren: () => import('./modals/addspecie-modal/addspecie-modal.module').then( m => m.AddspecieModalPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
