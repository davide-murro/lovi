import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioBookItem } from './audio-book-item';

describe('AudioBookItem', () => {
  let component: AudioBookItem;
  let fixture: ComponentFixture<AudioBookItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioBookItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioBookItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
