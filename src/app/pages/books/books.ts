import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BooksPaged } from "../../shared/books-paged/books-paged";
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-books',
  imports: [FontAwesomeModule, BooksPaged],
  templateUrl: './books.html',
  styleUrl: './books.scss'
})
export class Books {
  pageNumber = input(1, { transform: (v: number | undefined) => Number(v ?? 1) });
  pageSize = input(10, { transform: (v: number | undefined) => Number(v ?? 10) });
  sortBy = input('id', { transform: (v: string | undefined) => v ?? 'id' });
  sortOrder = input('asc', { transform: (v: 'asc' | 'desc' | undefined) => v ?? 'asc' });
  search = input('', { transform: (v: string | undefined) => v ?? '' });
}
