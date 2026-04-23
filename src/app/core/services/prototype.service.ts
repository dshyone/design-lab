import { Injectable, signal, computed, inject } from '@angular/core';
import { GithubService } from './github.service';
import { Prototype } from '../models/prototype.model';

@Injectable({ providedIn: 'root' })
export class PrototypeService {
  private github = inject(GithubService);

  private _prototypes = signal<Prototype[]>([]);
  private _sha = signal<string>('');
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _search = signal('');
  private _activeTags = signal<Set<string>>(new Set());

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly search = this._search.asReadonly();
  readonly activeTags = this._activeTags.asReadonly();
  readonly sha = this._sha.asReadonly();

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this._prototypes().forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  });

  readonly filtered = computed(() => {
    const q = this._search().toLowerCase().trim();
    const active = this._activeTags();
    return this._prototypes()
      .filter((p) => {
        const matchesSearch =
          !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        const matchesTags =
          active.size === 0 || p.tags.some((t) => active.has(t));
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  load() {
    this._loading.set(true);
    this._error.set(null);
    this.github.getPrototypes().subscribe({
      next: ({ prototypes, sha }) => {
        this._prototypes.set(prototypes);
        this._sha.set(sha);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Could not load prototypes. Check your network or repo config.');
        this._loading.set(false);
        console.error(err);
      },
    });
  }

  setSearch(q: string) {
    this._search.set(q);
  }

  toggleTag(tag: string) {
    const current = new Set(this._activeTags());
    current.has(tag) ? current.delete(tag) : current.add(tag);
    this._activeTags.set(current);
  }

  clearFilters() {
    this._search.set('');
    this._activeTags.set(new Set());
  }

  addPrototype(prototype: Prototype, pat: string) {
    const updated = [prototype, ...this._prototypes()];
    return new Promise<void>((resolve, reject) => {
      this.github.savePrototypes(updated, this._sha(), pat).subscribe({
        next: () => {
          this._prototypes.set(updated);
          resolve();
        },
        error: reject,
      });
    });
  }

  updatePrototype(updated: Prototype, pat: string) {
    const list = this._prototypes().map((p) => (p.id === updated.id ? updated : p));
    return new Promise<void>((resolve, reject) => {
      this.github.savePrototypes(list, this._sha(), pat).subscribe({
        next: () => {
          this._prototypes.set(list);
          resolve();
        },
        error: reject,
      });
    });
  }
}
