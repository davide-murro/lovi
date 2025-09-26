import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEpisode } from './podcast-episode';

describe('PodcastEpisode', () => {
  let component: PodcastEpisode;
  let fixture: ComponentFixture<PodcastEpisode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastEpisode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastEpisode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
