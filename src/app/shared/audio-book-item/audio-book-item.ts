import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioBookDto } from '../../core/models/dtos/audio-book-dto.model';

@Component({
  selector: 'app-audio-book-item',
  imports: [RouterLink],
  templateUrl: './audio-book-item.html',
  styleUrl: './audio-book-item.scss'
})
export class AudioBookItem {
  audioBook = input<AudioBookDto>(null!);
}
