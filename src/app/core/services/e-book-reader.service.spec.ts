import { TestBed } from '@angular/core/testing';

import { EBookReaderService } from './e-book-reader.service';

describe('EBookReaderService', () => {
  let service: EBookReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EBookReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
