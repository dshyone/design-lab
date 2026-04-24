import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
          <div class="field" *ngIf="showPatPrompt">
            <label class="label">GitHub Personal Access Token</label>
            <p class="hint">Required to save to GitHub. Stored only in this browser session.</p>
            <input class="input" type="password" placeholder="ghp_…" [(ngModel)]="pat" />
          </div>

          <!-- File upload (new prototypes only) -->
          <div class="field" *ngIf="!editMode">
            <label class="label">
              Exploration file
              <span class="optional">(HTML)</span>
            </label>
            <div
              class="drop-zone"
              [class.has-file]="selectedFileName"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              <input
                #fileInput
                type="file"
                accept=".html"
                style="display:none"
                (change)="onFileSelected($event)"
              />
              <ng-container *ngIf="!selectedFileName">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p class="drop-label">Drop an HTML file here or <span class="drop-link">browse</span></p>
              </ng-container>
              <ng-container *ngIf="selectedFileName">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p class="drop-filename">{{ selectedFileName }}</p>
                <button class="drop-clear" (click)="clearFile($event)">Remove</button>
              </ng-container>
            </div>
          </div>

          <div class="field">
            <label class="label">Title <span class="required">*</span></label>
            <input
              class="input"
              type="text"
              placeholder="e.g. Button hover animation"
              [(ngModel)]="form.title"
              (ngModelChange)="onTitleChange($event)"
            />
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
              <p class="hint" *ngIf="!editMode">Auto-filled from title. Edit if needed.</p>
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
            <p class="hint">Press Enter or comma to add.</p>
          </div>

          <p *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="cancel.emit()" [disabled]="saving">Cancel</button>
          <button class="btn-primary" (click)="submit()" [disabled]="!isValid() || saving">
            <svg *ngIf="saving" class="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            {{ savingLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: var(--space-4); }
    .modal { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-modal); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; background: var(--color-surface); z-index: 1; }
    .modal-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--color-text-primary); margin: 0; }
    .close-btn { background: none; border: none; cursor: pointer; padding: var(--space-1); color: var(--color-text-tertiary); border-radius: var(--radius-sm); display: flex; align-items: center; transition: color var(--transition-fast), background var(--transition-fast); }
    .close-btn:hover { color: var(--color-text-primary); background: var(--color-surface-hover); }
    .modal-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
    .modal-footer { padding: var(--space-4) var(--space-6); border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: var(--space-3); position: sticky; bottom: 0; background: var(--color-surface); }
    .field { display: flex; flex-direction: column; gap: var(--space-1); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-primary); }
    .required { color: var(--color-danger); }
    .optional { font-size: var(--text-xs); color: var(--color-text-tertiary); font-weight: 400; }
    .hint { font-size: var(--text-xs); color: var(--color-text-tertiary); margin: 0; }
    .input { font-size: var(--text-sm); font-family: var(--font-sans); color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 8px 12px; outline: none; background: var(--color-surface); transition: border-color var(--transition-fast); width: 100%; box-sizing: border-box; }
    .input:focus { border-color: var(--color-accent); }
    .textarea { resize: vertical; min-height: 64px; }
    .select { cursor: pointer; }

    /* Drop zone */
    .drop-zone {
      border: 1.5px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-6);
      display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
      cursor: pointer; transition: border-color var(--transition-fast), background var(--transition-fast);
      text-align: center; color: var(--color-text-tertiary);
    }
    .drop-zone:hover { border-color: var(--color-accent); background: var(--color-accent-subtle); }
    .drop-zone.has-file { border-style: solid; border-color: var(--color-accent); background: var(--color-accent-subtle); color: var(--color-text-primary); }
    .drop-label { font-size: var(--text-sm); margin: 0; }
    .drop-link { color: var(--color-accent); text-decoration: underline; }
    .drop-filename { font-size: var(--text-sm); font-weight: var(--weight-medium); margin: 0; color: var(--color-accent); }
    .drop-clear { font-size: var(--text-xs); color: var(--color-text-tertiary); background: none; border: none; cursor: pointer; text-decoration: underline; font-family: var(--font-sans); padding: 0; }

    /* Tags */
    .tag-input-wrap { border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 6px 8px; background: var(--color-surface); transition: border-color var(--transition-fast); }
    .tag-input-wrap:focus-within { border-color: var(--color-accent); }
    .tag-chips { display: flex; flex-wrap: wrap; gap: var(--space-1); align-items: center; }
    .chip { display: flex; align-items: center; gap: 4px; font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-tag-text); background: var(--color-tag-bg); border-radius: var(--radius-full); padding: 3px 8px; }
    .chip-remove { background: none; border: none; cursor: pointer; color: var(--color-tag-text); padding: 0; font-size: 14px; line-height: 1; }
    .tag-input { border: none; outline: none; font-size: var(--text-sm); font-family: var(--font-sans); background: none; min-width: 120px; flex: 1; }

    /* Buttons */
    .btn-primary { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); font-weight: var(--weight-medium); font-family: var(--font-sans); color: #fff; background: var(--color-accent); border: none; border-radius: var(--radius-sm); padding: 8px 20px; cursor: pointer; transition: background var(--transition-fast); }
    .btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary { font-size: var(--text-sm); font-weight: var(--weight-medium); font-family: var(--font-sans); color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 8px 20px; cursor: pointer; transition: background var(--transition-fast); }
    .btn-secondary:hover:not(:disabled) { background: var(--color-surface-hover); }
    .btn-secondary:disabled { opacity: .5; cursor: not-allowed; }
    .error-msg { color: var(--color-danger); font-size: var(--text-sm); margin: 0; }
    .spin-icon { animation: spin .7s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AddPrototypeModalComponent implements OnInit {
  @Input() existingTags: string[] = [];
  @Input() editing: Prototype | null = null;
  @Output() saved = new EventEmitter<{ prototype: Prototype; pat: string; fileContent?: string }>();
  @Output() cancel = new EventEmitter<void>();

  creators = CREATORS;
  form: Partial<Prototype> & { tags: string[] } = {
    title: '', description: '', creator: 'Craig', folder: '', tags: []
  };
  tagInput = '';
  pat = '';
  showPatPrompt = false;
  saving = false;
  errorMsg = '';
  selectedFileName = '';
  fileContent: string | undefined;

  get editMode() { return !!this.editing; }

  get savingLabel(): string {
    if (!this.saving) return this.editMode ? 'Save changes' : 'Add prototype';
    return this.fileContent ? 'Uploading…' : 'Saving…';
  }

  ngOnInit() {
    const stored = sessionStorage.getItem(PAT_KEY);
    this.showPatPrompt = !stored;
    if (stored) this.pat = stored;
    if (this.editing) this.form = { ...this.editing, tags: [...this.editing.tags] };
  }

  onTitleChange(title: string) {
    if (!this.editMode && !this._folderManuallyEdited) {
      this.form.folder = 'prototypes/' + this.slugify(title);
    }
  }

  private _folderManuallyEdited = false;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.readFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.name.endsWith('.html')) this.readFile(file);
  }

  private readFile(file: File) {
    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.fileContent = result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  clearFile(e: Event) {
    e.stopPropagation();
    this.selectedFileName = '';
    this.fileContent = undefined;
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
    };

    this.saved.emit({ prototype, pat: this.pat, fileContent: this.fileContent });
  }

  onSaveError(msg: string) { this.saving = false; this.errorMsg = msg; }
  onSaveSuccess() { this.saving = false; }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.cancel.emit();
  }
}
