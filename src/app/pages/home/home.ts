import { Component, signal, Signal } from '@angular/core';
import { AudioBooksPaged } from '../../shared/audio-books-paged/audio-books-paged';
import { PodcastsPaged } from '../../shared/podcasts-paged/podcasts-paged';
import { ImageSlider, ImageSliderItem } from '../../shared/image-slider/image-slider';
import { EBooksPaged } from '../../shared/e-books-paged/e-books-paged';

@Component({
  selector: 'app-home',
  imports: [AudioBooksPaged, EBooksPaged, PodcastsPaged, ImageSlider],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  imageSliderItems: Signal<ImageSliderItem[]> = signal([
    {
      image: 'home-image-slider/slider1.png',
      title: 'Ancient Wisdom Rediscovered',
      subtitle:
        'Stream esoteric audiobooks that explore lost civilizations, forgotten philosophies and hidden histories.',
    },
    {
      image: 'home-image-slider/slider2.png',
      title: 'Sacred Sounds, Deepened Connection',
      subtitle: 'Discover podcasts on meditation, chakra healing and ceremonial magic.',
    },
    {
      image: 'home-image-slider/slider3.png',
      title: 'Unveil The Mysteries',
      subtitle: 'Delve into alchemy, tarot and astrology with curated audio narratives.',
    },
  ]);
}
