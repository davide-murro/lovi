import { TestBed } from '@angular/core/testing';

import { EBooksService } from './e-books.service';

describe('EBooksService', () => {
  let service: EBooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EBooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
