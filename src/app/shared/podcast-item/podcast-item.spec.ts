import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastItem } from './podcast-item';

describe('PodcastItem', () => {
  let component: PodcastItem;
  let fixture: ComponentFixture<PodcastItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodcastItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
