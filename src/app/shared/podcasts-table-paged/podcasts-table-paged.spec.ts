import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastsTablePaged } from './podcasts-table-paged';

describe('PodcastsTablePaged', () => {
  let component: PodcastsTablePaged;
  let fixture: ComponentFixture<PodcastsTablePaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastsTablePaged]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PodcastsTablePaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
