import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPodcastEpisode } from './edit-podcast-episode';

describe('EditPodcastEpisode', () => {
  let component: EditPodcastEpisode;
  let fixture: ComponentFixture<EditPodcastEpisode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPodcastEpisode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPodcastEpisode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
