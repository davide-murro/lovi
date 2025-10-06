import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { myLibraryResolver } from './my-library.resolver';

describe('myLibraryResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => myLibraryResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
