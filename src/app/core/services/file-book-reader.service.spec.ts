import { TestBed } from '@angular/core/testing';

import { FileBookReaderService } from './file-book-reader.service';

describe('FileBookReaderService', () => {
  let service: FileBookReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileBookReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
