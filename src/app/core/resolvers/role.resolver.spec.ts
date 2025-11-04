import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { roleResolver } from './role.resolver';
import { RoleDto } from '../models/dtos/role-dto.model';

describe('roleResolver', () => {
  const executeResolver: ResolveFn<RoleDto | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => roleResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
