import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityAgencyComponent } from './city-agency.component';

describe('CityAgencyComponent', () => {
  let component: CityAgencyComponent;
  let fixture: ComponentFixture<CityAgencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityAgencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
