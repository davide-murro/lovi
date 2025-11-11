import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { catchError, of } from 'rxjs';
import { CreatorsService } from '../services/creators.service';
import { CreatorDto } from '../models/dtos/creator-dto.model';

export const creatorResolver: ResolveFn<CreatorDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const location = inject(Location);
  const creatorsService = inject(CreatorsService);

  return creatorsService.getById(id).pipe(
    catchError(() => {
      if (location.path() !== state.url) location.go(state.url);
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
