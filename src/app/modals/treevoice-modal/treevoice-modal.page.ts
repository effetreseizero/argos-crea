
import { Component, OnInit, Input } from '@angular/core';
import { 
  ModalController 
} from '@ionic/angular';


import{ TreelistService } from '../../services/treelist/treelist.service';
import{ GpswatchService } from '../../services/gpswatch/gpswatch.service';

import{ geohashForLocation } from 'geofire-common';


import{ WordRecService } from '../../services/tfjs/word-rec.service';

@Component({
  selector: 'app-treevoice-modal',
  templateUrl: './treevoice-modal.page.html',
  styleUrls: ['./treevoice-modal.page.scss'],
})
export class TreevoiceModalPage implements OnInit {

  @Input() specieList: String[];

  specie= "";
  d1= "";
  d2= "";

  recognizedWord ="";

  recording = false;
  probabilityThreshold = 99;

  lastcoords:any = {
    latitude:0,
    longitude:0,
    accuracy:1000,
    timestamp:0
  };

  constructor(
    private modalController: ModalController,
    private treelistService:TreelistService,
    private gpswatchService:GpswatchService,
    private wordrecService:WordRecService
  ) { }

  ngOnInit() {
    this.gpswatchService.getData().subscribe((data) =>{
      if(data){
        this.lastcoords = data;
      }
    });

    this.wordrecService.getData().subscribe((data) =>{
      if(this.recording&&data){
        this.readSpecie(data);
      }
    });
  }

  micButtonClick(){
    if(this.recording){
      if(this.wordrecService.streaming()){
        this.wordrecService.stopListening();
      }
      this.recording = false;
    }else{
        if(!this.wordrecService.streaming()){
          this.wordrecService.startListening();
        }
        this.recording=true;
    }
  };
  
  readSpecie(res){
    this.recognizedWord ="";
    let scores = res.scores;
    let rec_word = scores.sort((s1, s2) =>  s2.score - s1.score)[0].word;
    let rec_score = scores.sort((s1, s2) =>  s2.score - s1.score)[0].score;
    let rec_species = scores
      .filter((elem)=>{
        return this.specieList.includes(elem.word);
      })
      .filter((elem)=>{
        return elem.score>=(this.probabilityThreshold/100);
      })
      .sort((s1, s2) =>  s2.score - s1.score);
    if(rec_species.length>0){
      this.recognizedWord = "word: "+rec_species[0].word + " - score: " + (rec_species[0].score*100).toFixed(0);
      this.micButtonClick();
    }
    else{
      this.recognizedWord = rec_word +" (score insufficiente "+Math.round(rec_score*100)+"%) o non nella lista specie";
    }
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
