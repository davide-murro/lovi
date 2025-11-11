import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { catchError, of } from 'rxjs';
import { RolesService } from '../services/roles.service';
import { RoleDto } from '../models/dtos/auth/role-dto.model';

export const roleResolver: ResolveFn<RoleDto | null> = (route, state) => {
  const id = route.paramMap.get('id')!;
  const router = inject(Router);
  const location = inject(Location);
  const rolesService = inject(RolesService);

  return rolesService.getById(id).pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
