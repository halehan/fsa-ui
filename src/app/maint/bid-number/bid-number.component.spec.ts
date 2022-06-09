import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidNumberComponent } from './bid-number.component';

describe('BidNumberComponent', () => {
  let component: BidNumberComponent;
  let fixture: ComponentFixture<BidNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
