import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastDetails } from './podcast-details';

describe('PodcastDetails', () => {
  let component: PodcastDetails;
  let fixture: ComponentFixture<PodcastDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
