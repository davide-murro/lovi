import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { audioBookResolver } from './audio-book.resolver';

describe('audioBookResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => audioBookResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
