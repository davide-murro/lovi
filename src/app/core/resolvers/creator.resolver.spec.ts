import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { creatorResolver } from './creator.resolver';
import { CreatorDto } from '../models/dtos/creator-dto.model';

describe('creatorResolver', () => {
  const executeResolver: ResolveFn<CreatorDto | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => creatorResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
