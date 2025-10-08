import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioBookDetails } from './audio-book-details';

describe('AudioBookDetails', () => {
  let component: AudioBookDetails;
  let fixture: ComponentFixture<AudioBookDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioBookDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioBookDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
