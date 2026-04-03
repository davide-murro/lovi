import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEpisodeDetails } from './podcast-episode-details';

describe('PodcastEpisodeDetails', () => {
  let component: PodcastEpisodeDetails;
  let fixture: ComponentFixture<PodcastEpisodeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastEpisodeDetails]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PodcastEpisodeDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
