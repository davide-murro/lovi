import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookDto } from '../../core/models/dtos/book-dto.model';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';

@Component({
  selector: 'app-book-item',
  imports: [RouterLink, SecureMediaDirective],
  templateUrl: './book-item.html',
  styleUrl: './book-item.scss'
})
export class BookItem {
  book = input.required<BookDto>();

  creators = computed(() => {
    const readers = this.book().readers?.map(r => r.nickname) ?? [];
    const writers = this.book().writers?.map(r => r.nickname) ?? [];

    return [...new Set([...readers, ...writers])];
  });
}
