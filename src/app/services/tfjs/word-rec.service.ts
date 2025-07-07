import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


import * as tf from '@tensorflow/tfjs-core';
import * as speechCommands from '@tensorflow-models/speech-commands';


@Injectable({
  providedIn: 'root'
})
export class WordRecService {

  recognizer;
  modelLoaded = false;
  words = [];
  probabilityThreshold = 70;

  private myData: BehaviorSubject<any> = new BehaviorSubject<any>({
    scores:[]
  });

  constructor() {
    this.loadModel();
  }

  getData(): Observable<Array<any>> {
    return this.myData;
  }

  loadModel(): Promise<any>{
    this.recognizer = speechCommands.create(
      "BROWSER_FFT",
      null,
      'https://argos360.web.app/assets/tfjs_model/model.json',
      'https://argos360.web.app/assets/tfjs_model/metadata.json'
    );  
    return Promise.all([
        this.recognizer.ensureModelLoaded()
      ]).then(()=>{
        this.words = this.recognizer.wordLabels();
        this.modelLoaded = true;
    })
  }

  startListening(){
    this.recognizer.listen(res => {
        let scores = Array.from(res.scores).map((s, i) => ({score: +s, word: this.words[i]}));
        this.myData.next({
          scores: scores
        });
      }, 
      {
          probabilityThreshold: this.probabilityThreshold/100
      }
    );
  }

  stopListening(){
    this.recognizer.stopListening();
  }

  streaming():boolean{
    return this.recognizer.streaming;
  }
}
