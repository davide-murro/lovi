import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioBookDto } from '../../core/models/dtos/audio-book-dto.model';
import { HttpSrcDirective } from '../../core/directives/http-src.directive';

@Component({
  selector: 'app-audio-book-item',
  imports: [RouterLink, HttpSrcDirective],
  templateUrl: './audio-book-item.html',
  styleUrl: './audio-book-item.scss'
})
export class AudioBookItem {
  audioBook = input.required<AudioBookDto>();
}
