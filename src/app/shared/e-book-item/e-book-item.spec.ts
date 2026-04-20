import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbookItem } from './ebook-item';

describe('EbookItem', () => {
  let component: EbookItem;
  let fixture: ComponentFixture<EbookItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EbookItem]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EbookItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
