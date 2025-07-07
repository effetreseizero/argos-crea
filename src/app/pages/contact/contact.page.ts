import { Component, OnInit } from '@angular/core';
import { IonSlides, NavController,Platform  } from '@ionic/angular';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';



@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  map: Map;

  constructor(
    private platform:Platform
  ) { 
    platform.ready().then(() => {
      setTimeout(() => {
         this.initMap();
       }, 1000);
    })
  }

  ngOnInit() {
  }

  initMap() {
    //https://forum.ionicframework.com/t/generating-a-openlayers-map-as-a-component/161373/4
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        })],
      target: document.getElementById('map'),
      view: new View({
        center: [0, 0],
        zoom: 3
      })
    });
    setTimeout(() => {
      this.map.updateSize();
    }, 500);
  }

}
