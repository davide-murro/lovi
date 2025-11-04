import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersTablePaged } from './users-table-paged';

describe('UsersTablePaged', () => {
  let component: UsersTablePaged;
  let fixture: ComponentFixture<UsersTablePaged>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersTablePaged]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersTablePaged);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
