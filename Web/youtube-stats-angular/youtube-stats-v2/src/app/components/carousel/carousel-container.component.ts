import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WrappedResponse } from '../../models/wrapped.models';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-container.component.html',
  styleUrl: './carousel-container.component.scss',
})
export class CarouselContainerComponent implements AfterViewInit, OnDestroy {
  @Input() data: WrappedResponse | null = null;
  @ViewChild('track') trackRef!: ElementRef<HTMLElement>;

  activeIndex = 0;
  totalCards = 7;
  dots = [0, 1, 2, 3, 4, 5, 6];

  ngAfterViewInit(): void {
    this.setupScrollObserver();
    document.addEventListener('keydown', this.onKeydown);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    document.removeEventListener('keydown', this.onKeydown);
  }

  private observer?: IntersectionObserver;

  private setupScrollObserver(): void {
    const track = this.trackRef.nativeElement;
    const cards = track.querySelectorAll('.carousel-card');

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Array.from(cards).indexOf(entry.target as Element);
            if (index >= 0) this.activeIndex = index;
          }
        });
      },
      { root: track, threshold: 0.5 }
    );

    cards.forEach((card) => this.observer!.observe(card));
  }

  scrollTo(index: number): void {
    const track = this.trackRef.nativeElement;
    const cards = track.querySelectorAll('.carousel-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  private onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight' && this.activeIndex < this.totalCards - 1) {
      this.scrollTo(this.activeIndex + 1);
    } else if (e.key === 'ArrowLeft' && this.activeIndex > 0) {
      this.scrollTo(this.activeIndex - 1);
    }
  };
}
