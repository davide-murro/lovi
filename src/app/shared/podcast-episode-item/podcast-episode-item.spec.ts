import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEpisodeItem } from './podcast-episode-item';

describe('PodcastEpisodeItem', () => {
  let component: PodcastEpisodeItem;
  let fixture: ComponentFixture<PodcastEpisodeItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastEpisodeItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastEpisodeItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
