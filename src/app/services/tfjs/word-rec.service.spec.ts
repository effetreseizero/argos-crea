import { TestBed } from '@angular/core/testing';

import { WordRecService } from './word-rec.service';

describe('WordRecService', () => {
  let service: WordRecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordRecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
