import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { eBookResolver } from './e-book.resolver';
import { EBookDto } from '../models/dtos/e-book-dto.model';

describe('eBookResolver', () => {
  const executeResolver: ResolveFn<EBookDto | null> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => eBookResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
