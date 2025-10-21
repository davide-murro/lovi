import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogDialog } from './log-dialog';

describe('LogDialog', () => {
  let component: LogDialog;
  let fixture: ComponentFixture<LogDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
