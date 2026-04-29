import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksTablePaged } from './books-table-paged';

describe('BooksTablePaged', () => {
  let component: BooksTablePaged;
  let fixture: ComponentFixture<BooksTablePaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksTablePaged]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BooksTablePaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
