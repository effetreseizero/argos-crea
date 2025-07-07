//https://medium.com/runic-software/a-simple-guide-to-openlayers-in-angular-b10f6feb3df1


import {Component, NgZone, AfterViewInit, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';

import * as ol from "ol";

import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import View from "ol/View";
import Vector from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";

// https://medium.com/javascript-in-plain-english/how-to-improve-responsiveness-when-displaying-large-data-sets-in-openlayers-maps-dd6d0ad9abdf
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import { Point } from "ol/geom";
import Feature from "ol/Feature";

import {Coordinate} from 'ol/coordinate';
import { ScaleLine, defaults as DefaultControls} from 'ol/control';
import * as proj4 from 'proj4';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import {register}  from 'ol/proj/proj4';
import {get as GetProjection} from 'ol/proj'
import {Extent} from 'ol/extent';

import {Style, Stroke, Fill} from 'ol/style';

//https://turfjs.org/docs/#squareGrid
import * as turf from '@turf/turf';
import bbox from '@turf/bbox';
import {FeatureCollection as turfFeatureCollection, Point as turfPoint} from '@turf/turf';
import { leftShift } from 'mathjs';


@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})

export class OlMapComponent implements AfterViewInit {

  @Input() center: Coordinate;
  @Input() zoom: number;

  view: View;
  //projection: Projection;
  extent: Extent = [-20026376.39, -20048966.10,20026376.39, 20048966.10];

  Map: Map;
  treesLayer: WebGLPointsLayer<any>;

  @Output() mapReady = new EventEmitter<Map>(); 

  constructor(private zone: NgZone, private cd: ChangeDetectorRef) {
   }


  ngAfterViewInit():void {
    if (! this.Map) {
      //https://medium.com/runic-software/a-simple-guide-to-openlayers-in-angular-b10f6feb3df1
      this.zone.runOutsideAngular(() => this.initMap()) 
    } 
    setTimeout(()=>{
      //https://forum.ionicframework.com/t/generating-a-openlayers-map-as-a-component/161373/4
      this.Map.updateSize();
      this.mapReady.emit(this.Map);
    },500);
  }

  private initMap(): void{
    //proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    //register(proj4)
    //this.projection = GetProjection('EPSG:3857');
    //this.projection.setExtent(this.extent);

    this.view = new View({
      center: this.center,
      zoom: this.zoom,
      //projection: this.projection,
    });
    this.Map = new Map({
      layers: [new TileLayer({
        source: new OSM({})
      })],
      target: document.getElementById('map'),
      view: this.view,
      controls: DefaultControls().extend([
        new ScaleLine({}),
      ]),
    });
  }

  updateTreesLayer(array){
    
    if(array.length>0){
      this.Map.removeLayer(this.treesLayer);

      var features = array.map((element,index)=>{
        return new Feature({
          geometry: new Point([
            element.lng,
            element.lat
          //https://gis.stackexchange.com/questions/344530/use-point-feature-ol-in-openlayers
          ]).transform('EPSG:4326', 'EPSG:3857'),
          i: index,
          d: (element.d1+element.d2)/2,
          v: element.v,
          h: element.h,
          specie: element.specie
        });
      });
      
      //https://openlayers.org/en/latest/examples/webgl-points-layer.html
      let circleStyle = {
        symbol: {
          symbolType: "circle",
          size: ["interpolate", ["linear"], ["get", "d"], 50, 5, 80, 10, 120, 15],
          color: [
            "interpolate",
            ["linear"],
            ["get", "d"],
            50,
            "yellow",
            80,
            "blue",
            120,
            "red"
          ],
          rotateWithView: false
        }
      };
      
      let vectorSource = new Vector<Point>({
        features: features,
        format: new GeoJSON()
      });
      
      //https://medium.com/javascript-in-plain-english/how-to-improve-responsiveness-when-displaying-large-data-sets-in-openlayers-maps-dd6d0ad9abdf
      this.treesLayer = new WebGLPointsLayer({
        source: vectorSource,
        style: JSON.parse(JSON.stringify(circleStyle)),
        disableHitDetection: true
      });


      //https://github.com/ThomasG77/turf-ol3/blob/master/grids-squareGrid.html
      
      // cast type turfFeatureCollection turfPoint (conflict ol Points)
      let turfTrees = (new GeoJSON({'geometryName':'Point'})).writeFeaturesObject(vectorSource.getFeatures(), {'featureProjection': 'EPSG:3857'}) as turfFeatureCollection<turfPoint>;
      
      let gridBBBox = bbox(turfTrees);
      let cellSide = 25;
      let options = {units: "meters" as turf.Units};

      let squareGrid = turf.squareGrid(gridBBBox, cellSide, options);

      //https://turfjs.org/docs/#collect
      let volGrid = turf.collect(squareGrid, turfTrees, 'v', 'values');

      volGrid.features.forEach((f)=>{
        // compute vha per grid cell 
        f.properties.vtot=f.properties.values.reduce((vtot,v)=>{
          return vtot+v;
        },
        0);
        f.properties.vha = f.properties.vtot/(cellSide^2/10000);
      })

      let vtot_max = volGrid.features.reduce((max,f)=>{
        return f.properties.vtot>max?f.properties.vtot:max;
      },
      0);

      //https://developers.arcgis.com/openlayers/styles-and-data-visualization/style-a-feature-layer/
      const gridStyle = function (feature) {
        return new Style({
          fill: new Fill({
            color: [255,0,0,feature.getProperties().vtot/vtot_max]
          })
        });
      };
  
      

      var gridVectorSourcePolygons = new Vector();

      var vectorLayerPolygons = new VectorLayer({
        source: gridVectorSourcePolygons,
        style: gridStyle,
      });
    
      
      gridVectorSourcePolygons.addFeatures((new GeoJSON()).readFeatures(volGrid, {
        featureProjection: 'EPSG:3857'
      }));

      //https://thomasg77.github.io/turf-ol3/en/helper/featureCollection.html

      this.Map.addLayer(vectorLayerPolygons);
      this.Map.addLayer(this.treesLayer);
      this.Map.getView().fit(vectorSource.getExtent());
    }
  }

  zoomTreesLayer(){
     
  }
}


