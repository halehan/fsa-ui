import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidItemCodesComponent } from './bid-item-codes.component';

describe('BidItemCodesComponent', () => {
  let component: BidItemCodesComponent;
  let fixture: ComponentFixture<BidItemCodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidItemCodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidItemCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
