import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksPaged } from './books-paged';

describe('BooksPaged', () => {
  let component: BooksPaged;
  let fixture: ComponentFixture<BooksPaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksPaged]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BooksPaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
