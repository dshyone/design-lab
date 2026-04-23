import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prototype } from '../../core/models/prototype.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dl-prototype-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card" (click)="openFolder()">
      <div class="thumbnail">
        <img
          *ngIf="prototype.thumbnail; else placeholder"
          [src]="thumbnailUrl"
          [alt]="prototype.title"
          (error)="imgError = true"
        />
        <ng-template #placeholder>
          <div class="placeholder-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        </ng-template>
      </div>

      <div class="body">
        <div class="meta">
          <span class="creator">{{ prototype.creator }}</span>
          <span class="date">{{ prototype.date | date:'MMM d, y' }}</span>
        </div>
        <h3 class="title">{{ prototype.title }}</h3>
        <p *ngIf="prototype.description" class="description">{{ prototype.description }}</p>
        <div class="tags">
          <span *ngFor="let tag of prototype.tags" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="actions" (click)="$event.stopPropagation()">
        <button class="action-btn" title="Copy link" (click)="copyLink()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          {{ copied ? 'Copied!' : 'Copy link' }}
        </button>
        <button class="action-btn" title="Edit" (click)="edit.emit(prototype)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
      </div>
    </article>
  `,
  styles: [`
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: box-shadow var(--transition-base), transform var(--transition-base);
    }
    .card:hover {
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-2px);
    }
    .thumbnail {
      aspect-ratio: 16/9;
      background: var(--color-surface-subtle);
      overflow: hidden;
    }
    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-border-strong);
    }
    .body {
      padding: var(--space-4);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--color-text-tertiary);
    }
    .meta .creator {
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
    }
    .meta .date::before { content: '·'; margin-right: var(--space-2); }
    .title {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.3;
    }
    .description {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      margin-top: auto;
      padding-top: var(--space-2);
    }
    .tag {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--color-tag-text);
      background: var(--color-tag-bg);
      border-radius: var(--radius-full);
      padding: 2px 8px;
    }
    .actions {
      display: flex;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-4);
      border-top: 1px solid var(--color-border);
      background: var(--color-surface-subtle);
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      padding: 4px 8px;
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      font-family: var(--font-sans);
    }
    .action-btn:hover {
      background: var(--color-surface-hover);
      color: var(--color-text-primary);
    }
  `]
})
export class PrototypeCardComponent {
  @Input({ required: true }) prototype!: Prototype;
  @Output() edit = new EventEmitter<Prototype>();

  copied = false;
  imgError = false;

  get thumbnailUrl(): string {
    if (this.imgError || !this.prototype.thumbnail) return '';
    return `https://raw.githubusercontent.com/${environment.githubOwner}/${environment.githubRepo}/${environment.githubBranch}/${this.prototype.thumbnail}`;
  }

  openFolder() {
    const url = `https://github.com/${environment.githubOwner}/${environment.githubRepo}/tree/${environment.githubBranch}/${this.prototype.folder}`;
    window.open(url, '_blank');
  }

  copyLink() {
    const url = `${window.location.origin}/prototype/${this.prototype.id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
