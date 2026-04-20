import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EBooksPaged } from "../../shared/e-books-paged/e-books-paged";
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-e-books',
  imports: [FontAwesomeModule, EBooksPaged],
  templateUrl: './e-books.html',
  styleUrl: './e-books.scss'
})
export class EBooks {
  pageNumber = input(1, { transform: (v: number | undefined) => Number(v ?? 1) });
  pageSize = input(10, { transform: (v: number | undefined) => Number(v ?? 10) });
  sortBy = input('id', { transform: (v: string | undefined) => v ?? 'id' });
  sortOrder = input('asc', { transform: (v: 'asc' | 'desc' | undefined) => v ?? 'asc' });
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
