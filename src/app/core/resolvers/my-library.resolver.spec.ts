import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { myLibraryResolver } from './my-library.resolver';
import { LibraryDto } from '../models/dtos/library-dto.model';

describe('myLibraryResolver', () => {
  const executeResolver: ResolveFn<LibraryDto[] | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => myLibraryResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
