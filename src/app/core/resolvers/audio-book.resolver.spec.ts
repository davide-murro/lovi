import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { audioBookResolver } from './audio-book.resolver';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';

describe('audioBookResolver', () => {
  const executeResolver: ResolveFn<AudioBookDto | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => audioBookResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
