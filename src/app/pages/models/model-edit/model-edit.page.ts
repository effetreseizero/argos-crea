import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController  } from '@ionic/angular';

import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';

import{ ModelsService} from '../../../services/firestore/models.service';

//https://stackoverflow.com/questions/29074002/how-to-inject-mathjs-into-angular-js
import { parse, evaluate } from 'mathjs';

@Component({
  selector: 'app-model-edit',
  templateUrl: './model-edit.page.html',
  styleUrls: ['./model-edit.page.scss'],
})
export class ModelEditPage implements OnInit {

  modelId = null;
  model = null;
  modelForm: UntypedFormGroup;
  submitAttempt: boolean = false;

  specieArray = ["abete_rosso", "abete_bianco", "larice", "faggio", "pino_silvestre", "pino_nero", "pino_cembro", "castagno", "acero", "ontano", "pino_marittimo", "pino_domestico", "pino_laricio", "pino_daleppo", "tiglio", "olmo", "eucalipto", "frassino", "robinia", "douglasia", "salice", "pioppo", "rovere", "roverella", "cerro", "leccio", "altra_conifera", "altra_latifoglia"];
 
  tex_hmodel = "";
  tex_vmodel = "";

  d_test = 50;

  constructor(
    private activatedRoute:ActivatedRoute,
    private router:Router,
    private navController: NavController,
    private modelsService:ModelsService,
    public formBuilder: UntypedFormBuilder,
  ) { 
    this.modelForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      location: ['',],
      createdTime: ['', ],
      v_model: ['',[Validators.required]],
      h_model: ['',[Validators.required]],
      specie:['',[Validators.required]]
    });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {

        this.modelId = this.router.getCurrentNavigation().extras.state.id;
      
        //read survey data

        this.modelsService.read_model_document(this.modelId).subscribe((data)=>{
          this.model=data.payload.data();
          //https://angular.io/guide/deprecations#ngmodel-with-reactive-forms
          //https://ultimatecourses.com/blog/angular-2-form-controls-patch-value-set-value
          this.modelForm.patchValue(this.model);

        });

      }
    });
  }

  saveModel() {
    this.submitAttempt = true;

    if(this.modelForm.valid){
      let survey = this.modelForm.value;
      
      this.modelsService.update_model_document(this.modelId, survey);
      this.navController.back();
    }
  }


  parseHModelFormula(){
    let form_model = this.modelForm.value.h_model;
    let tex_model = parse(form_model).toTex({parenthesis: 'keep'});
    return "$"+tex_model+"$";
  }
  testHModel(){
    return evaluate(this.modelForm.value.h_model,{d:this.d_test});
  }

  parseVModelFormula(){
    let form_model = this.modelForm.value.v_model;
    return "$"+parse(form_model).toTex({parenthesis: 'keep'})+"$";
  }
  testVModel(){
    let tree_h =  evaluate(this.modelForm.value.h_model,{d:this.d_test});
    return evaluate(this.modelForm.value.v_model,{d:this.d_test,h:tree_h});
  }




}
