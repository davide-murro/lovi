import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesTablePaged } from './roles-table-paged';

describe('RolesTablePaged', () => {
  let component: RolesTablePaged;
  let fixture: ComponentFixture<RolesTablePaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesTablePaged]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesTablePaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
