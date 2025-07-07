import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

//https://github.com/capacitor-community/bluetooth-le
import { BleClient, numberToUUID, numbersToDataView, BleDevice } from '@capacitor-community/bluetooth-le';

const HEART_RATE_SERVICE = numberToUUID(0x180d);

import {SettingsService} from '../firestore/settings.service'
import { set } from 'ol/transform';

@Injectable({
  providedIn: 'root'
})
export class BtleService {

  private device: BehaviorSubject<BleDevice> = new BehaviorSubject<BleDevice>({deviceId:null});
  private data: BehaviorSubject<any> = new BehaviorSubject<any>({
    counter:-1,
    diameter:0,
    specie:0
  });

  private btle_connected;
  private caliper_btle_settings;


  constructor(
    private settingsService:SettingsService
  ) { 
    this.settingsService.read_settings_document().subscribe((data)=>{
      this.caliper_btle_settings = data.payload.data();
      if(this.caliper_btle_settings["caliper_random_data"]){
        this.caliper_btle_settings["caliper_btle_service"]="0000fff0-0000-1000-8000-00805f9b34fb";
        this.caliper_btle_settings["caliper_btle_diameter_charact"]="0000fff1-0000-1000-8000-00805f9b34fb";
        this.caliper_btle_settings["caliper_btle_counter_charact"]="0000fff2-0000-1000-8000-00805f9b34fb";
        this.caliper_btle_settings["caliper_btle_specie_charact"]="0000fff3-0000-1000-8000-00805f9b34fb";
      }
    });
  }

  getDevice(): Observable<any> {
    return this.device;
  }

  getData(): Observable<any> {
    return this.data;
  }

  async disconnect(){
    await BleClient.disconnect(this.device.value.deviceId);
  }

  onDisconnect(deviceId){
    this.device.next({deviceId:null});
    this.btle_connected = false;
  }

  async activateBTLE(activate,maxSpecie): Promise<boolean>{
    try {
        if(activate&&!this.btle_connected){
          let device = await BleClient.requestDevice({
            services: [this.caliper_btle_settings["caliper_btle_service"]],
          });
      
          // connect to device, the onDisconnect callback is optional
          await BleClient.connect(device.deviceId, (deviceId) => this.onDisconnect(deviceId));
          this.device.next(device);
          this.btle_connected = true;
          
          let zeroCounter = numbersToDataView([0]);
          await BleClient.write(
            this.device.value.deviceId,
            this.caliper_btle_settings["caliper_btle_service"],
            this.caliper_btle_settings["caliper_btle_counter_charact"],
            zeroCounter
          );

          let maxSpecieDV = numbersToDataView([maxSpecie]);
          await BleClient.write(
            this.device.value.deviceId,
            this.caliper_btle_settings["caliper_btle_service"],
            this.caliper_btle_settings["caliper_btle_maxspecie_charact"],
            maxSpecieDV
          );

          await BleClient.startNotifications(
            this.device.value.deviceId,
            this.caliper_btle_settings["caliper_btle_service"],
            this.caliper_btle_settings["caliper_btle_counter_charact"],
            (value) => {
              let newCounter = parseInt(
                value['get'+this.caliper_btle_settings["caliper_btle_counter_decode"]](
                  this.caliper_btle_settings["caliper_btle_counter_offset"],
                  this.caliper_btle_settings["caliper_btle_counter_endian"]
                )
              );
              console.log(newCounter);
              if(newCounter>this.data.value.counter){
                Promise.all([
                  BleClient.read(this.device.value.deviceId, this.caliper_btle_settings["caliper_btle_service"],this.caliper_btle_settings["caliper_btle_diameter_charact"]),
                  BleClient.read(this.device.value.deviceId, this.caliper_btle_settings["caliper_btle_service"],this.caliper_btle_settings["caliper_btle_specie_charact"])
                ]).then((values)=>{
                  let resDiameter = values[0];
                  let diameter = parseInt(resDiameter['get'+this.caliper_btle_settings["caliper_btle_diameter_decode"]](this.caliper_btle_settings["caliper_btle_diameter_offset"],this.caliper_btle_settings["caliper_btle_diameter_endian"]).toString());
                  let resSpecie = values[1];
                  let specie = parseInt(resSpecie['get'+this.caliper_btle_settings["caliper_btle_specie_decode"]](this.caliper_btle_settings["caliper_btle_specie_offset"],this.caliper_btle_settings["caliper_btle_specie_endian"]).toString());
                  let newData = {
                    counter: newCounter,
                    diameter: diameter,
                    specie: specie
                  };
  
                  this.data.next(newData);
                });
              }
              
            }
          );
      }else{
        await BleClient.stopNotifications(
          this.device.value.deviceId,
          this.caliper_btle_settings["caliper_btle_service"],
          this.caliper_btle_settings["caliper_btle_counter_charact"]
        );
        await BleClient.disconnect(this.device.value.deviceId);
        this.btle_connected = false;
        console.log('disconnected from device', this.device);
      }

      return this.btle_connected;
      //await BleClient.write(this.device.deviceId,serviceHexString,measureHexString,numbersToDataView([result.getUint8(0)+1]));

      //result = await BleClient.read(this.device.deviceId, serviceHexString,measureHexString);
      
    } catch (error) {
      //https://www.valentinog.com/blog/error/
      
      this.btle_connected = false;
      return this.btle_connected ;
    }
  }

  async scan(): Promise<String>{
    try {
      //https://github.com/capacitor-community/bluetooth-le
      let device = await BleClient.requestDevice({
        services: [this.caliper_btle_settings["caliper_btle_service"]],
      });
  
      // connect to device, the onDisconnect callback is optional
      await BleClient.connect(device.deviceId, (deviceId) => this.onDisconnect(deviceId));
      this.device.next(device);
      this.btle_connected = true;
    } catch (error) {
      this.btle_connected = false;
      return error.message;
    }
  }

  async read(): Promise<any>{
    try {
      let newData = {
        counter: 0,
        diameter: 0,
        specie:0,
      };
      
      if(!this.btle_connected){
        await this.scan();
      }
      let result = await BleClient.read(this.device.value.deviceId, this.caliper_btle_settings["caliper_btle_service"],this.caliper_btle_settings["caliper_btle_counter_charact"]);
      let counter = parseInt(result['get'+this.caliper_btle_settings["caliper_btle_counter_decode"]](this.caliper_btle_settings["caliper_btle_counter_offset"],this.caliper_btle_settings["caliper_btle_counter_endian"]).toString());
      
      result = await BleClient.read(this.device.value.deviceId, this.caliper_btle_settings["caliper_btle_service"],this.caliper_btle_settings["caliper_btle_diameter_charact"]);
      let diameter = parseInt(result['get'+this.caliper_btle_settings["caliper_btle_diameter_decode"]](this.caliper_btle_settings["caliper_btle_diameter_offset"],this.caliper_btle_settings["caliper_btle_diameter_endian"]).toString());
      
      result = await BleClient.read(this.device.value.deviceId, this.caliper_btle_settings["caliper_btle_service"],this.caliper_btle_settings["caliper_btle_specie_charact"]);
      let specie = parseInt(result['get'+this.caliper_btle_settings["caliper_btle_specie_decode"]](this.caliper_btle_settings["caliper_btle_specie_offset"],this.caliper_btle_settings["caliper_btle_specie_endian"]).toString());
      

      newData = {
        counter: counter,
        diameter: diameter,
        specie: specie
      };

      if(counter>this.data.value.counter){
        this.data.next(newData);
      }
        
      
      return newData;
      //await BleClient.write(this.device.deviceId,serviceHexString,measureHexString,numbersToDataView([result.getUint8(0)+1]));

      //result = await BleClient.read(this.device.deviceId, serviceHexString,measureHexString);
  
      
    } catch (error) {
      //https://www.valentinog.com/blog/error/
      return  Promise.reject("Device pairing or reading error");
    }
  }


}
