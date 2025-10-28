import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmChangeEmail } from './confirm-change-email';

describe('ConfirmChangeEmail', () => {
  let component: ConfirmChangeEmail;
  let fixture: ComponentFixture<ConfirmChangeEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmChangeEmail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmChangeEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
