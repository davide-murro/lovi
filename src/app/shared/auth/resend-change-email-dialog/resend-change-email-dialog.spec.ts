import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendChangeEmailDialog } from './resend-change-email-dialog';

describe('ResendChangeEmailDialog', () => {
  let component: ResendChangeEmailDialog;
  let fixture: ComponentFixture<ResendChangeEmailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendChangeEmailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResendChangeEmailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
