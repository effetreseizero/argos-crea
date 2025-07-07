import { Component, OnInit, Input } from '@angular/core';

import { 
  ModalController 
} from '@ionic/angular';


@Component({
  selector: 'app-addspecie-modal',
  templateUrl: './addspecie-modal.page.html',
  styleUrls: ['./addspecie-modal.page.scss'],
})
export class AddspecieModalPage implements OnInit {

  @Input() modelsList;

  @Input() specieList;

  sel_specie;
  sel_model_id;

  specieModelsList;
  

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  specieChanged(){
    this.specieModelsList = this.modelsList.filter((model)=>{return model.specie==this.sel_specie});
    this.sel_model_id = null;
  }

  async closeModal() {
    await this.modalController.dismiss({model:this.sel_model_id, specie:this.sel_specie});
  }

}
