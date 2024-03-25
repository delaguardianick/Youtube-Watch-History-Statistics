import { TestBed } from '@angular/core/testing';

import { PlotsService } from './plots.service';

describe('PlotsService', () => {
  let service: PlotsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlotsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
