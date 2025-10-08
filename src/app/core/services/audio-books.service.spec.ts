import { TestBed } from '@angular/core/testing';

import { AudioBooksService } from './audio-books.service';

describe('AudioBooksService', () => {
  let service: AudioBooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioBooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
