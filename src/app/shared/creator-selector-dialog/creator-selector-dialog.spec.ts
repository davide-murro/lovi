import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatorSelectorDialog } from './creator-selector-dialog';

describe('CreatorSelectorDialog', () => {
  let component: CreatorSelectorDialog;
  let fixture: ComponentFixture<CreatorSelectorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatorSelectorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatorSelectorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
