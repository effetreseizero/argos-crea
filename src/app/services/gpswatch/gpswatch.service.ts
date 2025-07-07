import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

//https://dev.to/saviosantos0808/real-time-localization-using-ionic-framework-and-google-spreadsheets-35pe
import { Geolocation } from '@capacitor/geolocation';


@Injectable({
  providedIn: 'root'
})
export class GpswatchService {

  private myData: BehaviorSubject<any> = new BehaviorSubject<any>({
    latitude:0,
    longitude:0,
    accuracy:0,
    timestamp:0
    });

  
  constructor(
  ) { 
    this.init();
  }

  async init(){
    Geolocation.watchPosition(
      {maximumAge: 1000, timeout: 5000, enableHighAccuracy: true},
      (resp) => {
        if(resp&&("coords" in resp)){
          this.myData.next({
            latitude:resp.coords.latitude,
            longitude:resp.coords.longitude,
            accuracy:resp.coords.accuracy,
            timestamp:resp.timestamp
            });
        }
      }
    );
  }


  getData(): Observable<Array<any>> {
    return this.myData;
  }
}