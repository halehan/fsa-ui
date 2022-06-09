import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorFineComponent } from './vendor-fine.component';

describe('VendorFineComponent', () => {
  let component: VendorFineComponent;
  let fixture: ComponentFixture<VendorFineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorFineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorFineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
