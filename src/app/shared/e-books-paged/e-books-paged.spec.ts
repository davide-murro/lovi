import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EBooksPaged } from './e-books-paged';

describe('EBooksPaged', () => {
  let component: EBooksPaged;
  let fixture: ComponentFixture<EBooksPaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EBooksPaged]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EBooksPaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
