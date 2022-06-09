import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeeDistComponent } from './admin-fee-dist.component';

describe('AdminFeeDistComponent', () => {
  let component: AdminFeeDistComponent;
  let fixture: ComponentFixture<AdminFeeDistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminFeeDistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeeDistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
