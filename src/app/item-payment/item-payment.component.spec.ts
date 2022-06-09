import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPaymentComponent } from './item-payment.component';

describe('ItemPaymentComponent', () => {
  let component: ItemPaymentComponent;
  let fixture: ComponentFixture<ItemPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
