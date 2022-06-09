import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByCheckComponent } from './search-by-check.component';

describe('SearchByCheckComponent', () => {
  let component: SearchByCheckComponent;
  let fixture: ComponentFixture<SearchByCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchByCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchByCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
