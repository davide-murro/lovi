import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastDetailsItem } from './podcast-details-item';

describe('PodcastDetailsItem', () => {
  let component: PodcastDetailsItem;
  let fixture: ComponentFixture<PodcastDetailsItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastDetailsItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PodcastDetailsItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
