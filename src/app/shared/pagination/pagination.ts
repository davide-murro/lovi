import { Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination',
  imports: [FontAwesomeModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class Pagination {
  // reactive signal inputs
  pageNumber = input<number>(1);
  pageSize = input<number>(10);
  totalCount = input<number>(0);
  maxVisiblePages = input<number>(7);

  // reactive output
  pageChange = output<number>();

  faAngleRight = faAngleRight;
  faAnglesRight = faAnglesRight;
  faAngleLeft = faAngleLeft;
  faAnglesLeft = faAnglesLeft;

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize()))
  );

  // compute visible pages as pure numbers only
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const max = this.maxVisiblePages();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + max - 1);

    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  goTo(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageChange.emit(page);
  }

  next() {
    if (this.pageNumber() < this.totalPages()) this.goTo(this.pageNumber() + 1);
  }

  prev() {
    if (this.pageNumber() > 1) this.goTo(this.pageNumber() - 1);
  }

  first() {
    this.goTo(1);
  }

  last() {
    this.goTo(this.totalPages());
  }
}
