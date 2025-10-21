import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CreatorsService } from '../services/creators.service';
import { CreatorDto } from '../models/dtos/creator-dto.model';

export const creatorResolver: ResolveFn<CreatorDto | null> = (route, state) => {
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);
  const creatorsService = inject(CreatorsService);

  return creatorsService.getById(id).pipe(
    catchError(() => {
      router.navigate(['/not-found'], { skipLocationChange: true });
      return of(null);
    })
  );
};
