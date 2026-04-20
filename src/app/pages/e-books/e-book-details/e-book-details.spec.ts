import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EBookDetails } from './e-book-details';

describe('EBookDetails', () => {
  let component: EBookDetails;
  let fixture: ComponentFixture<EBookDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EBookDetails]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EBookDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
