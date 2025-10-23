import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastsPaged } from './podcasts-paged';

describe('PodcastsPaged', () => {
  let component: PodcastsPaged;
  let fixture: ComponentFixture<PodcastsPaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastsPaged]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastsPaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
