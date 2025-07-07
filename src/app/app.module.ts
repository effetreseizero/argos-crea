import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
//https://www.angularjswiki.com/angular/cant-bind-to-ngmodel-since-it-isnt-a-known-property-of-input/
import { FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app-routing.module';


// https://jsmobiledev.com/article/crud-ionic-firestore
import { firebaseConfig } from './credentials';
//https://github.com/angular/angularfire/blob/master/docs/ionic/cli.md
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

//https://dev.to/saviosantos0808/real-time-localization-using-ionic-framework-and-google-spreadsheets-35pe
import { Geolocation } from '@capacitor/geolocation';

//https://medium.com/runic-software/a-simple-guide-to-openlayers-in-angular-b10f6feb3df1
import {OlMapComponent} from './components/ol-map/ol-map.component';

//https://stackoverflow.com/questions/62367201/ngfor-doesnt-work-in-modal-angular-ionic
import {TreeinputModalPage} from './modals/treeinput-modal/treeinput-modal.page'

//https://www.npmjs.com/package/mathjax-angular
import { MathjaxModule } from 'mathjax-angular';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
    declarations: [AppComponent, TreeinputModalPage],
    imports: [
        FormsModule,
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireDatabaseModule,
        AngularFirestoreModule,
        AngularFireAuthModule,
        MathjaxModule.forRoot( /*Optional Config*/),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
    ],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        //Geolocation,
        OlMapComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
