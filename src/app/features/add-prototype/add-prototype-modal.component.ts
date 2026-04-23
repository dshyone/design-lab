import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prototype, CREATORS } from '../../core/models/prototype.model';

const PAT_KEY = 'dl_github_pat';

@Component({
  selector: 'dl-add-prototype-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="overlay" (click)="onOverlayClick($event)">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 class="modal-title">{{ editMode ? 'Edit prototype' : 'Add prototype' }}</h2>
          <button class="close-btn" (click)="cancel.emit()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- PAT prompt (first time only) -->
          <div class="field" *ngIf="showPatPrompt">
            <label class="label">GitHub Personal Access Token</label>
            <p class="hint">Required to save changes to GitHub. Stored only in this browser session — never sent elsewhere.</p>
            <input class="input" type="password" placeholder="ghp_…" [(ngModel)]="pat" />
          </div>

          <div class="field">
            <label class="label">Title <span class="required">*</span></label>
            <input class="input" type="text" placeholder="e.g. Button hover animation" [(ngModel)]="form.title" />
          </div>

          <div class="field">
            <label class="label">Description</label>
            <textarea class="input textarea" placeholder="Short description of this exploration…" [(ngModel)]="form.description" rows="2"></textarea>
          </div>

          <div class="row">
            <div class="field">
              <label class="label">Creator <span class="required">*</span></label>
              <select class="input select" [(ngModel)]="form.creator">
                <option *ngFor="let c of creators" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Folder path <span class="required">*</span></label>
              <input class="input" type="text" placeholder="prototypes/my-exploration" [(ngModel)]="form.folder" />
            </div>
          </div>

          <div class="field">
            <label class="label">Tags</label>
            <div class="tag-input-wrap">
              <div class="tag-chips">
                <span *ngFor="let t of form.tags" class="chip">
                  {{ t }}
                  <button class="chip-remove" (click)="removeTag(t)">×</button>
                </span>
                <input
                  class="tag-input"
                  type="text"
                  placeholder="Add tag…"
                  [(ngModel)]="tagInput"
                  (keydown.enter)="addTag(); $event.preventDefault()"
                  (keydown.comma)="addTag(); $event.preventDefault()"
                  list="tag-suggestions"
                />
                <datalist id="tag-suggestions">
                  <option *ngFor="let t of existingTags" [value]="t"></option>
                </datalist>
              </div>
            </div>
            <p class="hint">Press Enter or comma to add. Existing tags shown as suggestions.</p>
          </div>

          <div class="field">
            <label class="label">Thumbnail path <span class="optional">(optional)</span></label>
            <input class="input" type="text" placeholder="prototypes/my-exploration/thumb.png" [(ngModel)]="form.thumbnail" />
          </div>

          <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="cancel.emit()" [disabled]="saving">Cancel</button>
          <button class="btn-primary" (click)="submit()" [disabled]="!isValid() || saving">
            {{ saving ? 'Saving…' : (editMode ? 'Save changes' : 'Add prototype') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 100;
      padding: var(--space-4);
    }
    .modal {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-modal);
      width: 100%; max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex; flex-direction: column;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      position: sticky; top: 0; background: var(--color-surface);
      z-index: 1;
    }
    .modal-title {
      font-size: var(--text-lg); font-weight: var(--weight-semibold);
      color: var(--color-text-primary); margin: 0;
    }
    .close-btn {
      background: none; border: none; cursor: pointer; padding: var(--space-1);
      color: var(--color-text-tertiary); border-radius: var(--radius-sm);
      display: flex; align-items: center;
      transition: color var(--transition-fast), background var(--transition-fast);
    }
    .close-btn:hover { color: var(--color-text-primary); background: var(--color-surface-hover); }
    .modal-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
    .modal-footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
      display: flex; justify-content: flex-end; gap: var(--space-3);
      position: sticky; bottom: 0; background: var(--color-surface);
    }
    .field { display: flex; flex-direction: column; gap: var(--space-1); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-primary); }
    .required { color: var(--color-danger); }
    .optional { font-size: var(--text-xs); color: var(--color-text-tertiary); font-weight: var(--weight-regular); }
    .hint { font-size: var(--text-xs); color: var(--color-text-tertiary); margin: 0; }
    .input {
      font-size: var(--text-sm); font-family: var(--font-sans);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      padding: 8px 12px; outline: none; background: var(--color-surface);
      transition: border-color var(--transition-fast);
      width: 100%; box-sizing: border-box;
    }
    .input:focus { border-color: var(--color-accent); }
    .textarea { resize: vertical; min-height: 64px; }
    .select { cursor: pointer; }
    .tag-input-wrap {
      border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      padding: 6px 8px; background: var(--color-surface);
      transition: border-color var(--transition-fast);
    }
    .tag-input-wrap:focus-within { border-color: var(--color-accent); }
    .tag-chips { display: flex; flex-wrap: wrap; gap: var(--space-1); align-items: center; }
    .chip {
      display: flex; align-items: center; gap: 4px;
      font-size: var(--text-xs); font-weight: var(--weight-medium);
      color: var(--color-tag-text); background: var(--color-tag-bg);
      border-radius: var(--radius-full); padding: 3px 8px;
    }
    .chip-remove {
      background: none; border: none; cursor: pointer;
      color: var(--color-tag-text); padding: 0; font-size: 14px; line-height: 1;
    }
    .tag-input {
      border: none; outline: none; font-size: var(--text-sm);
      font-family: var(--font-sans); background: none; min-width: 120px; flex: 1;
    }
    .btn-primary {
      font-size: var(--text-sm); font-weight: var(--weight-medium); font-family: var(--font-sans);
      color: #fff; background: var(--color-accent); border: none;
      border-radius: var(--radius-sm); padding: 8px 20px; cursor: pointer;
      transition: background var(--transition-fast);
    }
    .btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary {
      font-size: var(--text-sm); font-weight: var(--weight-medium); font-family: var(--font-sans);
      color: var(--color-text-secondary); background: var(--color-surface);
      border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      padding: 8px 20px; cursor: pointer;
      transition: background var(--transition-fast);
    }
    .btn-secondary:hover:not(:disabled) { background: var(--color-surface-hover); }
    .btn-secondary:disabled { opacity: .5; cursor: not-allowed; }
    .error-msg { color: var(--color-danger); font-size: var(--text-sm); margin: 0; }
  `]
})
export class AddPrototypeModalComponent implements OnInit {
  @Input() existingTags: string[] = [];
  @Input() editing: Prototype | null = null;
  @Output() saved = new EventEmitter<{ prototype: Prototype; pat: string }>();
  @Output() cancel = new EventEmitter<void>();

  creators = CREATORS;
  form: Partial<Prototype> & { tags: string[] } = {
    title: '', description: '', creator: 'Craig', folder: '', thumbnail: '', tags: []
  };
  tagInput = '';
  pat = '';
  showPatPrompt = false;
  saving = false;
  errorMsg = '';

  get editMode() { return !!this.editing; }

  ngOnInit() {
    const storedPat = sessionStorage.getItem(PAT_KEY);
    this.showPatPrompt = !storedPat;
    if (storedPat) this.pat = storedPat;

    if (this.editing) {
      this.form = { ...this.editing, tags: [...this.editing.tags] };
    }
  }

  addTag() {
    const t = this.tagInput.trim().toLowerCase().replace(/,/g, '');
    if (t && !this.form.tags.includes(t)) this.form.tags.push(t);
    this.tagInput = '';
  }

  removeTag(tag: string) {
    this.form.tags = this.form.tags.filter((t) => t !== tag);
  }

  isValid(): boolean {
    return !!(this.form.title?.trim() && this.form.creator && this.form.folder?.trim() && this.pat);
  }

  async submit() {
    if (!this.isValid()) return;
    if (this.tagInput.trim()) this.addTag();

    sessionStorage.setItem(PAT_KEY, this.pat);
    this.showPatPrompt = false;
    this.saving = true;
    this.errorMsg = '';

    const prototype: Prototype = {
      id: this.editing?.id ?? this.slugify(this.form.title!),
      title: this.form.title!.trim(),
      description: this.form.description?.trim() ?? '',
      creator: this.form.creator!,
      date: this.editing?.date ?? new Date().toISOString().slice(0, 10),
      tags: this.form.tags,
      folder: this.form.folder!.trim(),
      thumbnail: this.form.thumbnail?.trim() || undefined,
    };

    this.saved.emit({ prototype, pat: this.pat });
  }

  onSaveError(msg: string) {
    this.saving = false;
    this.errorMsg = msg;
  }

  onSaveSuccess() {
    this.saving = false;
  }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.cancel.emit();
  }
}
