import { TestBed } from '@angular/core/testing';

import { MaintService } from './maint.service';

describe('MaintService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MaintService = TestBed.get(MaintService);
    expect(service).toBeTruthy();
  });
});
