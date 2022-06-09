import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtableListComponent } from './atable-list.component';

describe('AtableListComponent', () => {
  let component: AtableListComponent;
  let fixture: ComponentFixture<AtableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtableListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
