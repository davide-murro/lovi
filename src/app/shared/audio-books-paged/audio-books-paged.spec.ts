import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioBooksPaged } from './audio-books-paged';

describe('AudioBooksPaged', () => {
  let component: AudioBooksPaged;
  let fixture: ComponentFixture<AudioBooksPaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioBooksPaged]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioBooksPaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
