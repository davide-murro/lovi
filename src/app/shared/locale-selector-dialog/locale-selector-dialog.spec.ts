import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocaleSelectorDialog } from './locale-selector-dialog';

describe('LocaleSelectorDialog', () => {
  let component: LocaleSelectorDialog;
  let fixture: ComponentFixture<LocaleSelectorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocaleSelectorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocaleSelectorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
