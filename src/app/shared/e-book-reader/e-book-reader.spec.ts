import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EBookReader } from './e-book-reader';

describe('EBookReader', () => {
  let component: EBookReader;
  let fixture: ComponentFixture<EBookReader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EBookReader]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EBookReader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
