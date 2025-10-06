import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { podcastResolver } from './podcast.resolver';
import { PodcastDto } from '../models/dtos/podcast-dto.model';

describe('podcastResolver', () => {
  const executeResolver: ResolveFn<PodcastDto | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => podcastResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
