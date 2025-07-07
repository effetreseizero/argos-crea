import { TestBed } from '@angular/core/testing';

import { GpswatchService } from './gpswatch.service';

describe('GpswatchService', () => {
  let service: GpswatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpswatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
