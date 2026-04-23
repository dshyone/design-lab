import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dl-tag-filter',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tag-filter" *ngIf="tags.length > 0">
      <button
        *ngFor="let tag of tags"
        class="tag-pill"
        [class.active]="activeTags.has(tag)"
        (click)="toggle.emit(tag)"
      >
        {{ tag }}
      </button>
      <button *ngIf="activeTags.size > 0" class="clear-btn" (click)="clear.emit()">
        Clear filters
      </button>
    </div>
  `,
  styles: [`
    .tag-filter {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }
    .tag-pill {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      border-radius: var(--radius-full);
      padding: 5px 12px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
      font-family: var(--font-sans);
    }
    .tag-pill:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
    .tag-pill.active {
      background: var(--color-tag-active-bg);
      color: var(--color-tag-active-text);
      border-color: var(--color-tag-active-bg);
    }
    .clear-btn {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--color-text-tertiary);
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px 4px;
      font-family: var(--font-sans);
      text-decoration: underline;
    }
    .clear-btn:hover { color: var(--color-text-secondary); }
  `]
})
export class TagFilterComponent {
  @Input({ required: true }) tags: string[] = [];
  @Input({ required: true }) activeTags: Set<string> = new Set();
  @Output() toggle = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
}
