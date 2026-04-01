import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPodcast } from './edit-podcast';

describe('EditPodcast', () => {
  let component: EditPodcast;
  let fixture: ComponentFixture<EditPodcast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPodcast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPodcast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
