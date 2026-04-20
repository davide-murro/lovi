import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EBookDto } from '../../core/models/dtos/e-book-dto.model';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';

@Component({
  selector: 'app-e-book-item',
  imports: [RouterLink, SecureMediaDirective],
  templateUrl: './e-book-item.html',
  styleUrl: './e-book-item.scss'
})
export class EBookItem {
  eBook = input.required<EBookDto>();
}
