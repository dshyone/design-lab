import { Component, ViewChild } from '@angular/core';
import { DashboardComponent } from './features/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
          <span class="brand-name">Design Lab</span>
        </div>
        <button class="add-btn" (click)="dashboard.openAdd()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add prototype
        </button>
      </div>
    </header>

    <main class="main">
      <dl-dashboard #dashboard />
    </main>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .header {
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface);
      position: sticky; top: 0; z-index: 10;
    }
    .header-inner {
      max-width: 1280px; margin: 0 auto;
      padding: 0 var(--space-6);
      height: 56px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand {
      display: flex; align-items: center; gap: var(--space-3);
      color: var(--color-text-primary);
    }
    .brand-name {
      font-size: var(--text-base); font-weight: var(--weight-semibold);
      letter-spacing: -0.01em;
    }
    .add-btn {
      display: flex; align-items: center; gap: var(--space-2);
      font-size: var(--text-sm); font-weight: var(--weight-medium); font-family: var(--font-sans);
      color: #fff; background: var(--color-accent);
      border: none; border-radius: var(--radius-sm);
      padding: 7px 14px; cursor: pointer;
      transition: background var(--transition-fast);
    }
    .add-btn:hover { background: var(--color-accent-hover); }
    .main {
      flex: 1;
      max-width: 1280px; margin: 0 auto; width: 100%;
      padding: var(--space-8) var(--space-6);
      box-sizing: border-box;
    }
    @media (max-width: 640px) {
      .header-inner { padding: 0 var(--space-4); }
      .main { padding: var(--space-6) var(--space-4); }
    }
  `]
})
export class AppComponent {
  @ViewChild('dashboard') dashboard!: DashboardComponent;
}
