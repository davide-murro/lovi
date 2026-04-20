import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEbook } from './edit-ebook';

describe('EditEbook', () => {
  let component: EditEbook;
  let fixture: ComponentFixture<EditEbook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEbook]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditEbook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
