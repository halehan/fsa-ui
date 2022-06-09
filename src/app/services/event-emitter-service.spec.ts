import { TestBed } from '@angular/core/testing';

import { EventEmitterServiceService } from './event-emitter-service';

describe('EventEmitterServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventEmitterServiceService = TestBed.get(EventEmitterServiceService);
    expect(service).toBeTruthy();
  });
});
