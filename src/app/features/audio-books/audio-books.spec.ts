import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioBooks } from './audio-books';

describe('AudioBooks', () => {
  let component: AudioBooks;
  let fixture: ComponentFixture<AudioBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioBooks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
