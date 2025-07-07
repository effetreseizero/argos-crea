import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyEditPage } from './survey-edit.page';

describe('SurveyEditPage', () => {
  let component: SurveyEditPage;
  let fixture: ComponentFixture<SurveyEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
