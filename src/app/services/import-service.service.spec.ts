import { TestBed } from '@angular/core/testing';

import { ImportServiceService } from './import-service.service';

describe('ImportServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImportServiceService = TestBed.get(ImportServiceService);
    expect(service).toBeTruthy();
  });
});
