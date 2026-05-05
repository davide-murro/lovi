import { Component, signal, Signal } from '@angular/core';
import { BooksPaged } from '../../shared/books-paged/books-paged';
import { PodcastsPaged } from '../../shared/podcasts-paged/podcasts-paged';
import { ImageSlider, ImageSliderItem } from '../../shared/image-slider/image-slider';

@Component({
  selector: 'app-home',
  imports: [BooksPaged, PodcastsPaged, ImageSlider],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  imageSliderItems: Signal<ImageSliderItem[]> = signal([
    {
      image: 'home-image-slider/slider1.png',
      title: 'Ancient Wisdom Rediscovered',
      subtitle:
        'Stream esoteric Audio Books that explore lost civilizations, forgotten philosophies and hidden histories.',
    },
    {
      image: 'home-image-slider/slider2.png',
      title: 'Sacred Sounds, Deepened Connection',
      subtitle: 'Discover Podcasts on meditation, chakra healing and ceremonial magic.',
    },
    {
      image: 'home-image-slider/slider3.png',
      title: 'Unveil The Mysteries',
      subtitle: 'Delve into alchemy, tarot and astrology with curated eBooks.',
    },
  ]);

  podcastsControlRoute = signal(false);
  podcastsHidePagination = signal(true);
  podcastsTitle = signal($localize`New Podcasts`);
  podcastsPageNumber = signal(1);
  podcastsPageSize = signal(10);
  podcastsSortBy = signal('createdAt');
  podcastsSortOrder = signal<'asc' | 'desc'>('desc');
  podcastsSearch = signal('');

  booksControlRoute = signal(false);
  booksHidePagination = signal(true);
  booksTitle = signal($localize`New Books`);
  booksPageNumber = signal(1);
  booksPageSize = signal(10);
  booksSortBy = signal('createdAt');
  booksSortOrder = signal<'asc' | 'desc'>('desc');
  booksSearch = signal('');
}
