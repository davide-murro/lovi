import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAlreadyTakenDialog } from './email-already-taken-dialog';

describe('EmailAlreadyTakenDialog', () => {
  let component: EmailAlreadyTakenDialog;
  let fixture: ComponentFixture<EmailAlreadyTakenDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailAlreadyTakenDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmailAlreadyTakenDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
