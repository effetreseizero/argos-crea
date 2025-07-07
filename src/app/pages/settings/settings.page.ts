import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController  } from '@ionic/angular';

import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ToastController } from '@ionic/angular';

import{SettingsService} from '../../services/firestore/settings.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  settings = null;
  settingsForm: UntypedFormGroup;

  constructor(
    private activatedRoute:ActivatedRoute,
    private router:Router,
    private navController: NavController,
    private settingsService:SettingsService,
    private formBuilder: UntypedFormBuilder,
    private toastController:ToastController
  ) {
    this.settingsForm = this.formBuilder.group({
      caliper_btle_service: ['', [Validators.required]],
      caliper_btle_diameter_charact: ['', [Validators.required]],
      caliper_btle_diameter_decode: ['', [Validators.required]],
      caliper_btle_diameter_offset: ['', [Validators.required]],
      caliper_btle_diameter_endian: ['', [Validators.required]],
      caliper_btle_counter_charact: ['', [Validators.required]],
      caliper_btle_counter_decode: ['', [Validators.required]],
      caliper_btle_counter_offset: ['', [Validators.required]],
      caliper_btle_counter_endian: ['', [Validators.required]],
      caliper_btle_maxspecie_charact: ['', [Validators.required]],
      caliper_btle_maxspecie_decode: ['', [Validators.required]],
      caliper_btle_maxspecie_offset: ['', [Validators.required]],
      caliper_btle_maxspecie_endian: ['', [Validators.required]],
      caliper_btle_specie_charact: ['', [Validators.required]],
      caliper_btle_specie_decode: ['', [Validators.required]],
      caliper_btle_specie_offset: ['', [Validators.required]],
      caliper_btle_specie_endian: ['', [Validators.required]],
      gps_random_error: ['', [Validators.required]],
      caliper_random_data: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.settingsService.read_settings_document().subscribe((data)=>{
      this.settings=data.payload.data();
      //https://angular.io/guide/deprecations#ngmodel-with-reactive-forms
      //https://ultimatecourses.com/blog/angular-2-form-controls-patch-value-set-value
      this.settingsForm.patchValue(this.settings);
    });
  }

  saveSettings() {
    if(this.settingsForm.valid){
      let data = this.settingsForm.value;
      this.settingsService.update_settings_document(data).then(
        async()=>{
        const toast = await this.toastController.create({
          message: "Settings saved",
          duration: 3000
        }
      );
        toast.present();
      });
    }
  }

}
