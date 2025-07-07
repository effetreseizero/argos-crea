//Menu https://www.positronx.io/add-dynamic-side-menu-in-ionic-with-active-class/
//Guard https://jsmobiledev.com/article/angular-guard

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

import { AuthGuard } from '../services/auth/auth.guard';

const routes: Routes = [
  {
    path: 'menu',
    component: MenuPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'models/models-list',
        loadChildren: () => import('../pages/models/models-list/models-list.module').then(m => m.ModelsListPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'models/model-edit',
        loadChildren: () => import('../pages/models/model-edit/model-edit.module').then( m => m.ModelEditPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'export',
        loadChildren: () => import('../pages/export/export.module').then(m => m.ExportPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'contact',
        loadChildren: () => import('../pages/contact/contact.module').then(m => m.ContactPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../pages/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../pages/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'registration',
        loadChildren: () => import('../pages/registration/registration.module').then(m => m.RegistrationPageModule)
      },
      {
        path: 'user-account',
        loadChildren: () => import('../pages/user-account/user-account.module').then( m => m.UserAccountPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'verify-email',
        loadChildren: () => import('../pages/verify-email/verify-email.module').then( m => m.VerifyEmailPageModule)
      },
      {
        path: 'survey-edit',
        loadChildren: () => import('../pages/survey-edit/survey-edit.module').then( m => m.SurveyEditPageModule),
        canActivate: [AuthGuard]
      }
      
    ]
  },
  {
    path: '',
    redirectTo: '/menu/home',
    pathMatch:'prefix'
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
