import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { userResolver } from './user.resolver';
import { UserProfileDto } from '../models/dtos/user-profile-dto.model';

describe('userResolver', () => {
  const executeResolver: ResolveFn<UserProfileDto | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => userResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
