//https://www.freakyjolly.com/ionic-firebase-crud-operations/#.X-2m2On0mEJ

//https://www.joshmorony.com/advanced-forms-validation-in-ionic-2/



import { Component, OnInit,ViewChild } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { IonSlides, NavController, ToastController, AlertController  } from '@ionic/angular';

import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';

import{ SurveysService} from '../../services/firestore/surveys.service';
import{ TreelistService } from '../../services/treelist/treelist.service';
import { ModelsService} from '../../services/firestore/models.service';

import{ GpswatchService } from '../../services/gpswatch/gpswatch.service'
import{ BtleService } from '../../services/btle/btle.service'

//import * as tf from '@tensorflow/tfjs';

import { PickerController } from "@ionic/angular";
import { PickerOptions } from "@ionic/core";

//https://forum.ionicframework.com/t/generating-a-openlayers-map-as-a-component/161373/4

import Map from 'ol/Map';

//https://medium.com/runic-software/a-simple-guide-to-openlayers-in-angular-b10f6feb3df1
import {OlMapComponent} from '../../components/ol-map/ol-map.component';


//https://firebase.google.com/docs/firestore/solutions/geoqueries
import{ geohashForLocation } from 'geofire-common';

import Plotly from 'plotly.js-dist';

//https://www.freakyjolly.com/ionic-modal-popovers-pass-receive-data/
import { ModalController } from '@ionic/angular';
import { AddspecieModalPage } from '../../modals/addspecie-modal/addspecie-modal.page';
import { TreeinputModalPage } from '../../modals/treeinput-modal/treeinput-modal.page';
import { TreevoiceModalPage } from '../../modals/treevoice-modal/treevoice-modal.page';
import { evaluate } from 'mathjs';



@Component({
  selector: 'app-survey-edit',
  templateUrl: './survey-edit.page.html',
  styleUrls: ['./survey-edit.page.scss'],
})
export class SurveyEditPage implements OnInit {

  surveyId = null;
  survey=null;
  treeList = [];

  //stats
  basalArea = 0;
  basalAreaHa = 0;
  volume = 0;
  volumeHa = 0;
  treeNumber = 0;
  treeNumberHa = 0;
  diameterDist = {};


  surveyForm: UntypedFormGroup;
  submitAttempt: boolean = false;

  specieSet = ["abete_rosso", "abete_bianco", "larice", "faggio", "pino_silvestre", "pino_nero", "pino_cembro", "castagno", "acero", "ontano", "pino_marittimo", "pino_domestico", "pino_laricio", "pino_daleppo", "tiglio", "olmo", "eucalipto", "frassino", "robinia", "douglasia", "salice", "pioppo", "rovere", "roverella", "cerro", "leccio", "altra_conifera", "altra_latifoglia"];
  diameterArray = [];
  publicInfiniteScrollSlice: number = 100;
  addTreePicker = null;
  modelsList  = null;

  selectedModels = [];

  enableOnOffBTLECaliper = false;

  //https://gist.github.com/mdorchain/90ee6a0b391b6c51b2e27c2b000f9bdd
  @ViewChild('surveySlider', { static: true }) surveySlider: IonSlides;
  slideOptsSurveySlider = {
    initialSlide: 0,  
    autoHeight: true
  };
  segmentSelected = 0;


  //https://www.pluralsight.com/guides/using-template-reference-variables-to-interact-with-nested-components
  @ViewChild('app_ol_map') olMapComponent:OlMapComponent;
  map: Map;

  lastcoords:any = {
    latitude:0,
    longitude:0,
    accuracy:1000,
    timestamp:0
  };
 
  constructor(
    private activatedRoute:ActivatedRoute,
    private navController: NavController,
    private router:Router,
    public formBuilder: UntypedFormBuilder,
    private surveysService:SurveysService,
    public modelsService: ModelsService,
    private toastController:ToastController,
    private pickerController: PickerController,
    public modalController: ModalController,
    private treelistService: TreelistService,
    private gpswatchService:GpswatchService,
    private alertController:AlertController,
    private btleService:BtleService,
  ) {

    //FORM
    this.surveyForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      location: ['', ],
      createdTime: ['', ],
      area_ha: [0,],
      min_d:[15,0],
      max_d:[1000,0],
      notes: ['', ],
      selectedModels:[[],]
    });

    this.diameterArray = [...Array(100).keys()].map(i => i + 15);

    
  }

  ngOnInit() {

    this.gpswatchService.getData().subscribe((data) =>{
      if(data){
        this.lastcoords = data;
      }
    })

    this.btleService.getData().subscribe((data) =>{
      if(data){
        if(data.specie>0&&data.specie<=this.selectedModels.length){
          let selected_model = this.selectedModels[data.specie-1];
          this.treelistService.addTree(
            selected_model,
            data.diameter,
            data.diameter
          );
        }
      }
    });

    this.loadSurvey();
    this.loadModels();
    
  }

  //https://www.pluralsight.com/guides/using-template-reference-variables-to-interact-with-nested-components
  ngAfterViewInit(){
    //subscribe to  treelist service to keep updated list and map
    this.treelistService.getData().subscribe((data) => {
      if(data){
        this.treeList = data;
        this.updateStats();
        this.olMapComponent.updateTreesLayer(this.treeList); 
      }
    });
  }

  async loadSurvey(){
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {

        this.surveyId = this.router.getCurrentNavigation().extras.state.id;
      
        //read survey data

        this.surveysService.read_surveys_document(this.surveyId).subscribe((data)=>{
          
          this.survey=data.payload.data();
          //https://angular.io/guide/deprecations#ngmodel-with-reactive-forms
          //https://ultimatecourses.com/blog/angular-2-form-controls-patch-value-set-value
          this.surveyForm.patchValue(this.survey);

          this.selectedModels = this.survey["selectedModels"]?this.survey["selectedModels"]:[];

          if(data.payload.data()['treeList']){
            this.treelistService.load(
              data.payload.data()['treeList'].sort(
                (itemA, itemB) => {
                  return itemB.createdTime - itemA.createdTime;
                }
              )
            );
                        
          }else{
            this.treelistService.load([]);
          }

        });

      }
    });
  }

  async loadModels(){
    this.modelsService.read_models_collection().subscribe(data => {
      this.modelsList = data
        .map(e => {

          let model = {};
          //add id of syrvey
          model["id"]=e.payload.doc.id;
          model["isEdit"]= false;
          //add all other properties
          for (let key of Object.keys(e.payload.doc.data())){
            model[key] = e.payload.doc.data()[key];
          }

          //https://stackoverflow.com/questions/2388115/get-locale-short-date-format-using-javascript/31663241
          var date = new Date(model["createdTime"]);
          var options = {
              year: "numeric",
              month: "2-digit",
              day: "numeric",
              hour: "numeric",
              minute:"numeric"
          };
          model["short_date"] =  date.toLocaleDateString("it") //en is language option, you may specify..
          return model;
        })
        .filter(x => x["deleted"] != true)
        .sort(
          (itemA, itemB) => {
            return itemB["createdTime"] - itemA["createdTime"];
          }
        );
    });
  }

  saveSurvey() {
    this.submitAttempt = true;

    if(!this.surveyForm.valid){
        this.surveySlider.slideTo(0);
    } 
    else{
      let survey = this.surveyForm.value;
      survey.selectedModels = this.selectedModels.map(item=>{
        //https://stackoverflow.com/questions/46578701/firestore-add-custom-object-to-db
        return JSON.parse( JSON.stringify(item));
      });
      survey.treeList = this.treeList.map(item=>{
        //https://stackoverflow.com/questions/46578701/firestore-add-custom-object-to-db
        return JSON.parse( JSON.stringify(item));
      });
      this.surveysService.update_surveys_document(this.surveyId, survey);
      this.navController.back();
    }
  }

  refreshModel(){
    let refTreeList = this.treeList.map((tree)=>{
      let model = this.selectedModels.filter((model)=>model.specie==tree.specie)[0];
      if(model){
        let d = ((parseFloat(tree.d1)+parseFloat(tree.d2))/2);
        tree.h = evaluate(model.h_model,{d:d});
        tree.v = evaluate(model.v_model,{d:d,h:tree.h}); 
      }
      return tree;
    });
    this.treelistService.load(refTreeList);
  }

  async addModel(){
    const modal = await this.modalController.create({
      component: AddspecieModalPage,
      cssClass: 'addspecie-modal-css',
      showBackdrop: true,
      componentProps: {
        'modelsList': this.modelsList,
        'specieList': new Set(this.modelsList.map((model)=>model.specie))

      }
    });
    let model_inserted = false;
    modal.onDidDismiss().then(async(modalDataResponse) => {
      if (modalDataResponse !== null) {
        if(this.selectedModels.filter((model)=>model.specie==modalDataResponse.data.specie).length==0){
          let sel_model = this.modelsList.filter((item)=>item.id==modalDataResponse.data.model)[0];
          this.selectedModels.push(
            sel_model
          )
        }else{
          const toast = await this.toastController.create({
            message: 'La specie ha già un modello',
            duration: 2000,
          });
          toast.present();
        }
      }
    });
    return await modal.present();
  }

  deleteModel(i){
    this.selectedModels.splice(i,1);
  }

  switchBtleCaliper(event){
    this.btleService.activateBTLE(event.detail.checked,this.selectedModels.length).then((data)=>{
      this.enableOnOffBTLECaliper = data;
    });
  }

  async addTreeCalc() {
    const modal = await this.modalController.create({
      component: TreeinputModalPage,
      cssClass: 'treeinput-modal-css',
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
      showBackdrop: false,
      componentProps: {
        'selectedModels': this.selectedModels,
      }
    });

    return await modal.present();
  }

  async addTreeVoice() {
    const modal = await this.modalController.create({
      component: TreevoiceModalPage,
      cssClass: 'treevoice-modal-css',
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
      showBackdrop: false,
      componentProps: {
        'specieList': this.selectedModels,
      }
    });

    return await modal.present();
  }

  
  async showErrorToast(data: any) {
    let toast = await this.toastController.create({
      message: data,
      duration: 3000,
      position: 'top'
    });

    toast.present();
  }


  deleteTree(i,tree) {
    this.treelistService.removeTree(i);
  }

 
  async editTree(index,record) {
    let pickerSpecieOptions = this.surveyForm.value.specieList.map((item)=>{return {"value":item,"text":item}});
    let pickerDiameterOptions1 = this.diameterArray.map((item)=>{return {"value":item,"text":item}});
    let pickerDiameterOptions2 = this.diameterArray.map((item)=>{return {"value":item,"text":item}});
    let opts: PickerOptions = {
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Done'
        }
      ],
      columns: [
        {
          name: 'Specie',
          options: pickerSpecieOptions
        },
        {
          name: 'D1',
          options: pickerDiameterOptions1
        },
        {
          name: 'D2',
          options: pickerDiameterOptions2
        }
      ]
    };
    this.addTreePicker = await this.pickerController.create(opts);
    
    this.addTreePicker.onDidDismiss().then(async data => {
      

      this.treeList[index].specie = data.data.Specie.value;
      this.treeList[index].d1 = data.data.D1.value;
      this.treeList[index].d2 = data.data.D2.value;

      this.treelistService.load(this.treeList);


    });


    this.addTreePicker.present();
  }


  //https://gist.github.com/mdorchain/90ee6a0b391b6c51b2e27c2b000f9bdd
  async segmentChanged($event){
    this.surveySlider.slideTo(this.segmentSelected);
  }
  async slideChanged($event) {
    this.segmentSelected = await this.surveySlider.getActiveIndex();
    this.olMapComponent.updateTreesLayer(this.treeList);
    this.updateStats();
  }


  //infine scroll
  doInfinite(infiniteScroll) {
    this.publicInfiniteScrollSlice += 100;
    infiniteScroll.target.complete();
    
  }

  public onMapReady(event) {
    this.map = event;
    if(this.treeList.length>0){
      this.olMapComponent.updateTreesLayer(this.treeList);
      this.olMapComponent.zoomTreesLayer();
    }
  }


  public updateStats(){
    if(this.treeList.length>0){
      this.treeNumber = this.treeList.length;
      this.treeNumberHa = this.treeNumber/this.surveyForm.value.area_ha

      this.volume = this.treeList.reduce(
        (v,tree)=>{
          return v+tree.v;
        },
        0
      );
      this.volumeHa = this.volume/this.surveyForm.value.area_ha
      this.basalArea = this.treeList.reduce(
        (ba,tree)=>{
          let dm = ((tree.d1/100)+(tree.d2/100))/2;
          return ba+Math.PI*((dm/2)**2);
        },
        0
      );
      this.basalAreaHa = this.basalArea/this.surveyForm.value.area_ha
      
      //Pie chart Volume percentuale per specie

      var vhatot_data = [{
        values: [],
        labels: [],
        type: 'pie'
      }];
      this.selectedModels.forEach((model) => {
        vhatot_data[0].labels.push(model.specie);
        vhatot_data[0].values.push(this.treeList
          .filter((tree)=>tree.specie===model.specie)
          .reduce((tot,tree)=>{
            return tot+tree.v;
          },0)/this.volume
        );
      });
      var vhatot_layout = {
        title: 'V% per specie',
      };
      Plotly.newPlot('vhatotPie', vhatot_data, vhatot_layout);




      //Istogramma Numero di piante per diametro
      let d_data=[];
      this.selectedModels.forEach((model) => {
        d_data.push(
          {
            x: this.treeList
            .filter((tree)=>tree.specie===model.specie)
            .map((tree)=>{
              return (tree.d1/1+tree.d2/1)/2;
            }),
            type: 'histogram',
            name: model.specie,
            autobinx: false,
            xbins: {
              end: 202.5,  
              size: 5, 
              start: 12.5
          }
          }
        )
      });  
      var d_layout = {
        title: 'Numero di piante per diametro',
        xaxis: {
          title: 'd (cm)'
        },
        yaxis: {
          title: 'N'
        },
        bargap: 0.05,
        barmode: 'stack'
      };
      Plotly.newPlot('diameterDist', d_data, d_layout); 

      //Istogramma Volume per diametro
    
      var v_data = [
        
      ]

      this.selectedModels.forEach((model) => {
        let varray = this.treeList
            .filter((tree)=>tree.specie===model.specie)
            .reduce((varray,tree)=>{
                let dm = (tree.d1/1+tree.d2/1)/2;
                let cd = 20+Math.floor((dm-17.5)/5)*5;
                varray.cd.push(""+cd);
                varray.v.push(tree.v);
                return varray;
              },{cd:[],v:[]});
        v_data.push(
          {
            histfunc: "sum",
            y: varray.v,
            x: varray.cd,
            type: "histogram",
            name: model.specie,
            xbins: {
              end: 202.5,  
              size: 5, 
              start: 12.5
          }
          }
        )
      }); 
      
      var v_layout = {
        title: 'V per diametro',
        xaxis: {
          title: 'd (cm)'
        },
        yaxis: {
          title: 'V'
        },
        bargap: 0.05,
        barmode: 'stack'
      };

      Plotly.newPlot('volumeDist', v_data, v_layout)
      
    }
  }

  private sampleTreeList = 
  {
    "type": "FeatureCollection",
    "name": "trees",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
    { "type": "Feature", "properties": { "id": 1, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024329194505825, 46.151247077352217 ] } },
    { "type": "Feature", "properties": { "id": 4, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024115773055385, 46.150992206420426 ] } },
    { "type": "Feature", "properties": { "id": 5, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02408692681426, 46.150973355866753 ] } },
    { "type": "Feature", "properties": { "id": 6, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023853739663288, 46.15074730971201 ] } },
    { "type": "Feature", "properties": { "id": 7, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023870185655408, 46.150733602317693 ] } },
    { "type": "Feature", "properties": { "id": 8, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023858045367374, 46.150744505160773 ] } },
    { "type": "Feature", "properties": { "id": 9, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023817694622142, 46.150681771362507 ] } },
    { "type": "Feature", "properties": { "id": 10, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023591392565336, 46.1506210381513 ] } },
    { "type": "Feature", "properties": { "id": 11, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023616898625857, 46.150602236974734 ] } },
    { "type": "Feature", "properties": { "id": 12, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023590500696383, 46.150603194841864 ] } },
    { "type": "Feature", "properties": { "id": 13, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02358932882726, 46.150608691236521 ] } },
    { "type": "Feature", "properties": { "id": 14, "d1": 20, "d2": 20, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023574519194097, 46.150630281604059 ] } },
    { "type": "Feature", "properties": { "id": 15, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023489691881277, 46.150694442721807 ] } },
    { "type": "Feature", "properties": { "id": 16, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023483347364259, 46.150706480853472 ] } },
    { "type": "Feature", "properties": { "id": 17, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023583479277681, 46.150780740919927 ] } },
    { "type": "Feature", "properties": { "id": 18, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023651685023411, 46.150895716507762 ] } },
    { "type": "Feature", "properties": { "id": 19, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023646147534969, 46.151084684022905 ] } },
    { "type": "Feature", "properties": { "id": 20, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023638516240492, 46.151146955311177 ] } },
    { "type": "Feature", "properties": { "id": 21, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023638353072968, 46.151144148645223 ] } },
    { "type": "Feature", "properties": { "id": 22, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023639188954965, 46.151143128901403 ] } },
    { "type": "Feature", "properties": { "id": 23, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023633390591062, 46.151132865857114 ] } },
    { "type": "Feature", "properties": { "id": 24, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023594893301027, 46.151144755778915 ] } },
    { "type": "Feature", "properties": { "id": 25, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.0235913699882, 46.15115168313838 ] } },
    { "type": "Feature", "properties": { "id": 26, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023653034542944, 46.15115926210099 ] } },
    { "type": "Feature", "properties": { "id": 27, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023671063699059, 46.151211387660098 ] } },
    { "type": "Feature", "properties": { "id": 28, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.023760657029298, 46.151324053928654 ] } },
    { "type": "Feature", "properties": { "id": 29, "d1": 20, "d2": 20, "specie": "abete_bianco" }, "geometry": { "type": "Point", "coordinates": [ 11.023999188057516, 46.151377987510692 ] } },
    { "type": "Feature", "properties": { "id": 30, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024053573976486, 46.151430524324802 ] } },
    { "type": "Feature", "properties": { "id": 31, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024084218842733, 46.151511100525063 ] } },
    { "type": "Feature", "properties": { "id": 32, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024075709032516, 46.151526379085553 ] } },
    { "type": "Feature", "properties": { "id": 33, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024091809205421, 46.151750666022906 ] } },
    { "type": "Feature", "properties": { "id": 34, "d1": 45, "d2": 45, "specie": "larice" }, "geometry": { "type": "Point", "coordinates": [ 11.024104540978707, 46.151778659208929 ] } },
    { "type": "Feature", "properties": { "id": 35, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024114472115647, 46.151805862826926 ] } },
    { "type": "Feature", "properties": { "id": 36, "d1": 30, "d2": 30, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024190976185457, 46.151817474538838 ] } },
    { "type": "Feature", "properties": { "id": 37, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02421283138432, 46.151835228002362 ] } },
    { "type": "Feature", "properties": { "id": 38, "d1": 70, "d2": 70, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024339433324824, 46.151880438736654 ] } },
    { "type": "Feature", "properties": { "id": 39, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024364000232785, 46.151943447834434 ] } },
    { "type": "Feature", "properties": { "id": 40, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024409551609978, 46.152101198283617 ] } },
    { "type": "Feature", "properties": { "id": 41, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024409739657884, 46.152112711095988 ] } },
    { "type": "Feature", "properties": { "id": 42, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02441285900103, 46.152111966631786 ] } },
    { "type": "Feature", "properties": { "id": 43, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024481647689027, 46.152157462822252 ] } },
    { "type": "Feature", "properties": { "id": 44, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024639808608322, 46.152260352352897 ] } },
    { "type": "Feature", "properties": { "id": 45, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024735077749073, 46.152387742071454 ] } },
    { "type": "Feature", "properties": { "id": 46, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024895106079841, 46.152489155280932 ] } },
    { "type": "Feature", "properties": { "id": 47, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024898018941165, 46.152488465452841 ] } },
    { "type": "Feature", "properties": { "id": 48, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025091248048204, 46.152666673626342 ] } },
    { "type": "Feature", "properties": { "id": 49, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025089072410431, 46.152666509881421 ] } },
    { "type": "Feature", "properties": { "id": 50, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025116911478847, 46.152710405124381 ] } },
    { "type": "Feature", "properties": { "id": 51, "d1": 30, "d2": 30, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025139182245168, 46.152742901749271 ] } },
    { "type": "Feature", "properties": { "id": 52, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025141749281737, 46.152741445128697 ] } },
    { "type": "Feature", "properties": { "id": 53, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02509427568938, 46.152788765064159 ] } },
    { "type": "Feature", "properties": { "id": 54, "d1": 30, "d2": 30, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025086802743493, 46.152787399787229 ] } },
    { "type": "Feature", "properties": { "id": 55, "d1": 45, "d2": 45, "specie": "larice" }, "geometry": { "type": "Point", "coordinates": [ 11.025076763765179, 46.15278868745952 ] } },
    { "type": "Feature", "properties": { "id": 56, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025228924262438, 46.152976345609623 ] } },
    { "type": "Feature", "properties": { "id": 57, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025354117985104, 46.153122033992858 ] } },
    { "type": "Feature", "properties": { "id": 58, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025330042290491, 46.153120681473894 ] } },
    { "type": "Feature", "properties": { "id": 59, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025356063313566, 46.153143530877855 ] } },
    { "type": "Feature", "properties": { "id": 60, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025379775548899, 46.153157007258827 ] } },
    { "type": "Feature", "properties": { "id": 61, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025437367818068, 46.153206032658112 ] } },
    { "type": "Feature", "properties": { "id": 62, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025437871683391, 46.153206900506156 ] } },
    { "type": "Feature", "properties": { "id": 63, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025753536523052, 46.153611439132838 ] } },
    { "type": "Feature", "properties": { "id": 64, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025739922021314, 46.153612861765289 ] } },
    { "type": "Feature", "properties": { "id": 65, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025790556979972, 46.15365687922462 ] } },
    { "type": "Feature", "properties": { "id": 66, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025818852773156, 46.153674746870223 ] } },
    { "type": "Feature", "properties": { "id": 67, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025829310003163, 46.153671761285217 ] } },
    { "type": "Feature", "properties": { "id": 68, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025838375821978, 46.15368357243608 ] } },
    { "type": "Feature", "properties": { "id": 69, "d1": 55, "d2": 55, "specie": "larice" }, "geometry": { "type": "Point", "coordinates": [ 11.025832551374556, 46.153680376932421 ] } },
    { "type": "Feature", "properties": { "id": 70, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025839889126413, 46.15367909212663 ] } },
    { "type": "Feature", "properties": { "id": 71, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025847491546626, 46.153681031923519 ] } },
    { "type": "Feature", "properties": { "id": 72, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025833027350194, 46.153687412508923 ] } },
    { "type": "Feature", "properties": { "id": 73, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025860602307644, 46.153720649302421 ] } },
    { "type": "Feature", "properties": { "id": 74, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025935803686655, 46.153748298668525 ] } },
    { "type": "Feature", "properties": { "id": 75, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026092077355818, 46.153885353842099 ] } },
    { "type": "Feature", "properties": { "id": 76, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026073908364612, 46.153874012825021 ] } },
    { "type": "Feature", "properties": { "id": 77, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026074142394075, 46.153871801132063 ] } },
    { "type": "Feature", "properties": { "id": 78, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026061357569397, 46.153885018069026 ] } },
    { "type": "Feature", "properties": { "id": 79, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02606597612748, 46.153921772888459 ] } },
    { "type": "Feature", "properties": { "id": 80, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02607558532681, 46.153939137315625 ] } },
    { "type": "Feature", "properties": { "id": 81, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026259717002661, 46.15399880417614 ] } },
    { "type": "Feature", "properties": { "id": 82, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026261367163688, 46.153997156689321 ] } },
    { "type": "Feature", "properties": { "id": 83, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026295205972049, 46.154081392391767 ] } },
    { "type": "Feature", "properties": { "id": 84, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026304479543706, 46.154101520764776 ] } },
    { "type": "Feature", "properties": { "id": 85, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026331811598451, 46.154207925777463 ] } },
    { "type": "Feature", "properties": { "id": 86, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026328950915474, 46.154217427879537 ] } },
    { "type": "Feature", "properties": { "id": 87, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026418491336907, 46.154314347650335 ] } },
    { "type": "Feature", "properties": { "id": 88, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026434004899938, 46.154315927766277 ] } },
    { "type": "Feature", "properties": { "id": 89, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026533892882044, 46.154415086136062 ] } },
    { "type": "Feature", "properties": { "id": 90, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02655773976891, 46.154425113960578 ] } },
    { "type": "Feature", "properties": { "id": 91, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026615826956492, 46.154504366595098 ] } },
    { "type": "Feature", "properties": { "id": 92, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026785046403516, 46.154710084299829 ] } },
    { "type": "Feature", "properties": { "id": 93, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026785134509721, 46.154710799705036 ] } },
    { "type": "Feature", "properties": { "id": 94, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026784921321823, 46.154713228068786 ] } },
    { "type": "Feature", "properties": { "id": 95, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026826897296184, 46.154721237593044 ] } },
    { "type": "Feature", "properties": { "id": 96, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.0268598255411, 46.154721506899861 ] } },
    { "type": "Feature", "properties": { "id": 97, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026865571338499, 46.154720781774031 ] } },
    { "type": "Feature", "properties": { "id": 98, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027064411006846, 46.154910066119221 ] } },
    { "type": "Feature", "properties": { "id": 99, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027078438677821, 46.15493042497075 ] } },
    { "type": "Feature", "properties": { "id": 100, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027080237472351, 46.154932245308785 ] } },
    { "type": "Feature", "properties": { "id": 101, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027131335832159, 46.154998237848169 ] } },
    { "type": "Feature", "properties": { "id": 102, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027388990948765, 46.155312877330729 ] } },
    { "type": "Feature", "properties": { "id": 103, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027363515667968, 46.155286249729791 ] } },
    { "type": "Feature", "properties": { "id": 104, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027389244268058, 46.155324598305853 ] } },
    { "type": "Feature", "properties": { "id": 105, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027396549230687, 46.155312946803988 ] } },
    { "type": "Feature", "properties": { "id": 106, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027396986930578, 46.155014820907894 ] } },
    { "type": "Feature", "properties": { "id": 107, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027390354964075, 46.154998785940954 ] } },
    { "type": "Feature", "properties": { "id": 108, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027358629677069, 46.154937851737671 ] } },
    { "type": "Feature", "properties": { "id": 109, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027299689774683, 46.15491191087095 ] } },
    { "type": "Feature", "properties": { "id": 110, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.027294299094805, 46.154905389515903 ] } },
    { "type": "Feature", "properties": { "id": 111, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026767323004671, 46.154471868152562 ] } },
    { "type": "Feature", "properties": { "id": 112, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026832926672876, 46.154468015062371 ] } },
    { "type": "Feature", "properties": { "id": 113, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026807482918741, 46.154392709803311 ] } },
    { "type": "Feature", "properties": { "id": 114, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.0268035930103, 46.154361194985725 ] } },
    { "type": "Feature", "properties": { "id": 115, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026510217387688, 46.153987554561709 ] } },
    { "type": "Feature", "properties": { "id": 116, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026511162463365, 46.153984707392638 ] } },
    { "type": "Feature", "properties": { "id": 117, "d1": 70, "d2": 70, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026492205917307, 46.153971828152386 ] } },
    { "type": "Feature", "properties": { "id": 118, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026441810614335, 46.153868774048036 ] } },
    { "type": "Feature", "properties": { "id": 119, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026447617687298, 46.153872812471199 ] } },
    { "type": "Feature", "properties": { "id": 120, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026430413569846, 46.153856848948578 ] } },
    { "type": "Feature", "properties": { "id": 121, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026372515185413, 46.153811468825403 ] } },
    { "type": "Feature", "properties": { "id": 122, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026379093371755, 46.153816356731404 ] } },
    { "type": "Feature", "properties": { "id": 123, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.026281284102572, 46.153665814610669 ] } },
    { "type": "Feature", "properties": { "id": 124, "d1": 30, "d2": 30, "specie": "abete_bianco" }, "geometry": { "type": "Point", "coordinates": [ 11.026086869921738, 46.153539725965764 ] } },
    { "type": "Feature", "properties": { "id": 125, "d1": 80, "d2": 80, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025988041664721, 46.153480573763225 ] } },
    { "type": "Feature", "properties": { "id": 126, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025989017352398, 46.153394170787074 ] } },
    { "type": "Feature", "properties": { "id": 127, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025770427282541, 46.153197745873946 ] } },
    { "type": "Feature", "properties": { "id": 128, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025606989371521, 46.15290087618488 ] } },
    { "type": "Feature", "properties": { "id": 129, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025604522902521, 46.15290593527309 ] } },
    { "type": "Feature", "properties": { "id": 130, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025594250490267, 46.152901422101237 ] } },
    { "type": "Feature", "properties": { "id": 131, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025459877654065, 46.152824093689077 ] } },
    { "type": "Feature", "properties": { "id": 132, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025397866702709, 46.152708720707778 ] } },
    { "type": "Feature", "properties": { "id": 133, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02528653069572, 46.152503991124341 ] } },
    { "type": "Feature", "properties": { "id": 134, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025284952602696, 46.152500267729856 ] } },
    { "type": "Feature", "properties": { "id": 135, "d1": 40, "d2": 40, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025284652232976, 46.152498526920141 ] } },
    { "type": "Feature", "properties": { "id": 136, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025280759731785, 46.152498242108862 ] } },
    { "type": "Feature", "properties": { "id": 137, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024678688940924, 46.152089657289515 ] } },
    { "type": "Feature", "properties": { "id": 138, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024565877377917, 46.151905522352038 ] } },
    { "type": "Feature", "properties": { "id": 139, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024474090428374, 46.151873476663447 ] } },
    { "type": "Feature", "properties": { "id": 140, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024467627898508, 46.151868954556846 ] } },
    { "type": "Feature", "properties": { "id": 141, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024307026728108, 46.151629246516251 ] } },
    { "type": "Feature", "properties": { "id": 142, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024293886248342, 46.151574705925576 ] } },
    { "type": "Feature", "properties": { "id": 143, "d1": 20, "d2": 20, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024143888861246, 46.151350990057281 ] } },
    { "type": "Feature", "properties": { "id": 144, "d1": 50, "d2": 50, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024135224651877, 46.151352188192106 ] } },
    { "type": "Feature", "properties": { "id": 145, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024081218617528, 46.151317083697883 ] } },
    { "type": "Feature", "properties": { "id": 146, "d1": 35, "d2": 35, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024146542976851, 46.151216422509918 ] } },
    { "type": "Feature", "properties": { "id": 147, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024159534072705, 46.151229180595337 ] } },
    { "type": "Feature", "properties": { "id": 2, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024594983026015, 46.151477654165937 ] } },
    { "type": "Feature", "properties": { "id": 3, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02460447957, 46.151469862265465 ] } },
    { "type": "Feature", "properties": { "id": 148, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024904470152929, 46.151488048415878 ] } },
    { "type": "Feature", "properties": { "id": 149, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.024911108051409, 46.151482276228798 ] } },
    { "type": "Feature", "properties": { "id": 150, "d1": 70, "d2": 70, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.02504219105068, 46.151433887181675 ] } },
    { "type": "Feature", "properties": { "id": 151, "d1": 80, "d2": 80, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025301613257858, 46.1516801148612 ] } },
    { "type": "Feature", "properties": { "id": 152, "d1": 55, "d2": 55, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025370695037022, 46.151984316700975 ] } },
    { "type": "Feature", "properties": { "id": 153, "d1": 45, "d2": 45, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025357336814203, 46.152071821257792 ] } },
    { "type": "Feature", "properties": { "id": 154, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025452942921635, 46.152117639188148 ] } },
    { "type": "Feature", "properties": { "id": 155, "d1": 60, "d2": 60, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025509303034138, 46.152184023059867 ] } },
    { "type": "Feature", "properties": { "id": 156, "d1": 30, "d2": 30, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025495377532945, 46.152301814760236 ] } },
    { "type": "Feature", "properties": { "id": 157, "d1": 65, "d2": 65, "specie": "abete_rosso" }, "geometry": { "type": "Point", "coordinates": [ 11.025488668974623, 46.152285792221285 ] } }
    ]
    }
  
  
 

}
