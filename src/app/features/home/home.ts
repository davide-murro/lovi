import { Component, signal, Signal } from '@angular/core';
import { AudioBooksPaged } from '../../shared/audio-books-paged/audio-books-paged';
import { PodcastsPaged } from '../../shared/podcasts-paged/podcasts-paged';
import { ImageSlider, ImageSliderItem } from '../../shared/image-slider/image-slider';

@Component({
  selector: 'app-home',
  imports: [AudioBooksPaged, PodcastsPaged, ImageSlider],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  imageSliderItems: Signal<ImageSliderItem[]> = signal([
    {
      image: 'home-image-slider/slider1.png',
      title: 'Listen to your next great story',
      subtitle: 'Stream or download from our library of audiobooks, including new releases and best sellers.'
    },
    {
      image: 'home-image-slider/slider2.jpg',
      title: 'Discover a new world of sound',
      subtitle: 'Explore hand-picked audio stories crafted for every mood and moment.'
    },
  ]);
}
