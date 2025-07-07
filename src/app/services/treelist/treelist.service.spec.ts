import { TestBed } from '@angular/core/testing';

import { TreelistService } from './treelist.service';

describe('TreelistService', () => {
  let service: TreelistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreelistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
