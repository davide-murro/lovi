import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCreator } from './edit-creator';

describe('EditCreator', () => {
  let component: EditCreator;
  let fixture: ComponentFixture<EditCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCreator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCreator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
