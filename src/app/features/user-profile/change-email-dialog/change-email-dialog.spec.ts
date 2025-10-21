import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeEmailDialog } from './change-email-dialog';

describe('ChangeEmailDialog', () => {
  let component: ChangeEmailDialog;
  let fixture: ComponentFixture<ChangeEmailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeEmailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeEmailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
