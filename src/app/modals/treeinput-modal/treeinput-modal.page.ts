//https://www.freakyjolly.com/ionic-modal-popovers-pass-receive-data/

import { Component, OnInit, Input } from '@angular/core';

import { ToastController } from '@ionic/angular';

import { ModalController } from '@ionic/angular';

import{ TreelistService } from '../../services/treelist/treelist.service';


import { evaluate } from 'mathjs';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-my-modal',
  templateUrl: './treeinput-modal.page.html',
  styleUrls: ['./treeinput-modal.page.scss'],
})
export class TreeinputModalPage implements OnInit {

  @Input() selectedModels;

  selected_model= "";
  d1= "";
  d2= "";

  mode="open";

  random_coords = false;

  lastcoords:any = {
    latitude:0,
    longitude:0,
    accuracy:1000,
    timestamp:0
  };

  constructor(
    private modalController: ModalController,
    private treelistService:TreelistService,
  ) {
    
   }

  ngOnInit() {


  }

  click(cifra){
    switch(this.mode){
      case "open":
        this.d1=this.d1+cifra;
        this.d2=this.d2+cifra;
        break;
      case "d1":
        this.d1=this.d1+cifra;
        break;
      case "d2":
        this.d2=this.d2+cifra;
        break;
    }
  }

  modifyD(d){
    switch(d){
      case "d1":
        this.d1="";
        break;
      case "d2":
          this.d2="";
          break;
    }
    this.mode = d;
  }

  cancelCalc(){
    switch(this.mode){
      case "open":
        this.d1=this.d1.slice(0,-1);
        this.d2=this.d2.slice(0,-1);
        break;
      case "d1":
          this.d1=this.d1.slice(0,-1);
          break;
      case "d2":
          this.d2=this.d2.slice(0,-1);
          break;

    }
  }
  
  addCalcTree(){
    if(this.selected_model!=""&&this.d1!=""&&this.d2!=""){
      let model = this.selectedModels.filter((item)=>item.id==this.selected_model)[0];
      this.treelistService.addTree(model,this.d1,this.d2);
    }
  }


  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

}