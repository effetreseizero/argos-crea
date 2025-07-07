import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {SettingsService} from '../firestore/settings.service'
import{ GpswatchService } from '../../services/gpswatch/gpswatch.service';

import{ geohashForLocation } from 'geofire-common';
import { evaluate } from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class TreelistService {
  private myData: BehaviorSubject<Array<any>> = new BehaviorSubject<[]>([]);
  

  private app_settings;
  
  constructor(
    private gpswatchService:GpswatchService,
    private settingsService:SettingsService
  ) { 
    this.settingsService.read_settings_document().subscribe((data)=>{
      this.app_settings = data.payload.data();
    });
    this.gpswatchService.getData().subscribe((data) =>{
      if(data){
        this.lastcoords = data;
      }
    });
  }

  lastcoords:any = {
    latitude:0,
    longitude:0,
    accuracy:1000,
    timestamp:0
  };

  ngOnInit(){

  }

  async load(treelist) {
    this.myData.next(treelist);
  }

  addTree(selected_model,d1,d2): void {

    if(selected_model!=""&&d1!=""&&d2!=""){
      let lat = 0
      let lng = 0;
      if(this.lastcoords.timestamp>0){
        lat = this.lastcoords.latitude;
        lng = this.lastcoords.longitude; 
      
      }
      if (this.app_settings["gps_random_error"]){
        function getRandomInRange(from, to, fixed) {
          return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
        }
        var lat_dev = getRandomInRange(-0.001, 0.001, 6);
        var lng_dev =  getRandomInRange(-0.001, 0.001, 6);
        lat += lat_dev;
        lng += lng_dev;
      }
      let d = ((parseFloat(d1)+parseFloat(d2))/2);
      let h = evaluate(selected_model.h_model,{d:d});
      let v = evaluate(selected_model.v_model,{d:d,h:h});

      let tree = {
        specie:selected_model.specie,
        d1:d1,
        d2:d2,
        h:h,
        v:v,
        lat:lat,
        lng:lng,
        geohash:geohashForLocation([lat, lng]),
        createdTime: Date.now()
      };
      const currentValue = this.myData.value;
      const updatedValue = [tree,...currentValue];
      this.myData.next(updatedValue);
    }
  }

  removeTree(i): void {
    const currentValue = this.myData.value;
    currentValue.splice(i,1);
    this.myData.next(currentValue);
  }

  getData(): Observable<Array<any>> {
    return this.myData;
  }
}