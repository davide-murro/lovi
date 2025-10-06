import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { podcastEpisodeResolver } from './podcast-episode.resolver';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';

describe('podcastEpisodeResolver', () => {
  const executeResolver: ResolveFn<PodcastEpisodeDto | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => podcastEpisodeResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
