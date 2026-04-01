import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioBookDto } from '../../core/models/dtos/audio-book-dto.model';
import { SecureMediaDirective } from '../../core/directives/secure-media.directive';

@Component({
  selector: 'app-audio-book-item',
  imports: [RouterLink, SecureMediaDirective],
  templateUrl: './audio-book-item.html',
  styleUrl: './audio-book-item.scss'
})
export class AudioBookItem {
  audioBook = input.required<AudioBookDto>();
}
