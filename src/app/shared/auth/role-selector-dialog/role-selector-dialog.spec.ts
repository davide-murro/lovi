import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleSelectorDialog } from './role-selector-dialog';

describe('RoleSelectorDialog', () => {
  let component: RoleSelectorDialog;
  let fixture: ComponentFixture<RoleSelectorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSelectorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleSelectorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
