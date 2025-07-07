import { TestBed } from '@angular/core/testing';

import { BtleService } from './btle.service';

describe('BtleService', () => {
  let service: BtleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BtleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
