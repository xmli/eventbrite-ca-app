import { TestBed, inject } from '@angular/core/testing';

import { EventbriteService } from './eventbrite.service';

describe('EventbriteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventbriteService]
    });
  });

  it('should be created', inject([EventbriteService], (service: EventbriteService) => {
    expect(service).toBeTruthy();
  }));
});
