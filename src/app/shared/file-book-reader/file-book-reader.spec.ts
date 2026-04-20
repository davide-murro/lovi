import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileBookReader } from './file-book-reader';

describe('FileBookReader', () => {
  let component: FileBookReader;
  let fixture: ComponentFixture<FileBookReader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileBookReader]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FileBookReader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
