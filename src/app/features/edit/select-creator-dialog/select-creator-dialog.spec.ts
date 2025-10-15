import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCreatorDialog } from './select-creator-dialog';

describe('SelectCreatorDialog', () => {
  let component: SelectCreatorDialog;
  let fixture: ComponentFixture<SelectCreatorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCreatorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCreatorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
