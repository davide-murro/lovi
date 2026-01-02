import {
  afterNextRender,
  Component,
  effect,
  HostListener,
  inject,
  Injector,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Subscription, interval } from 'rxjs';

export interface ImageSliderItem {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

@Component({
  selector: 'app-image-slider',
  imports: [FontAwesomeModule],
  templateUrl: './image-slider.html',
  styleUrl: './image-slider.scss',
})
export class ImageSlider implements OnDestroy {
  private readonly injector = inject(Injector);

  // Reactive inputs using Angular's `input()` API
  items = input<ImageSliderItem[]>([]);
  autoplay = input<boolean>(false);
  intervalMs = input<number>(5000);
  loop = input<boolean>(true);
  showArrows = input<boolean>(true);
  pauseOnHover = input<boolean>(true);

  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;

  // Internal reactive signals
  current = signal(0);
  isHovering = signal(false);

  private autoplaySub?: Subscription;
  private startX = 0;
  private endX = 0;

  constructor() {
    // Reactively restart autoplay when inputs change
    effect(() => {
      this.clearAutoplay();
      if (this.autoplay() && this.items().length > 1) {
        // start autoplay when everything is loaded
        afterNextRender(
          () => this.startAutoplay(),
          { injector: this.injector }
        );
      }
    });
  }
  ngOnDestroy() {
    this.clearAutoplay();
  }

  private startAutoplay() {
    this.autoplaySub = interval(this.intervalMs()).subscribe(() => {
      if (this.pauseOnHover() && this.isHovering()) return;
      this.next();
    });
  }

  private clearAutoplay() {
    if (this.autoplaySub) {
      this.autoplaySub.unsubscribe();
      this.autoplaySub = undefined;
    }
  }

  prev() {
    const imgs = this.items();
    if (imgs.length === 0) return;
    const newIndex =
      this.current() === 0 ? (this.loop() ? imgs.length - 1 : 0) : this.current() - 1;
    this.current.set(newIndex);
  }

  next() {
    const imgs = this.items();
    if (imgs.length === 0) return;
    const newIndex =
      this.current() === imgs.length - 1 ? (this.loop() ? 0 : this.current()) : this.current() + 1;
    this.current.set(newIndex);
  }

  goTo(index: number) {
    const imgs = this.items();
    if (index < 0 || index >= imgs.length) return;
    this.current.set(index);
  }

  onMouseEnter() {
    this.isHovering.set(true);
  }
  onMouseLeave() {
    this.isHovering.set(false);
  }

  onTouchStart(e: TouchEvent) {
    this.startX = e.touches[0].clientX;
  }
  onTouchMove(e: TouchEvent) {
    this.endX = e.touches[0].clientX;
  }
  onTouchEnd() {
    if (this.startX && this.endX) {
      const diff = this.endX - this.startX;
      if (Math.abs(diff) > 40) diff > 0 ? this.prev() : this.next();
    }
    this.startX = 0;
    this.endX = 0;
  }
}
