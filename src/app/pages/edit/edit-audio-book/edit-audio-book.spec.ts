import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAudioBook } from './edit-audio-book';

describe('EditAudioBook', () => {
  let component: EditAudioBook;
  let fixture: ComponentFixture<EditAudioBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAudioBook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAudioBook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
