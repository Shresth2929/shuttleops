import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="page-header">
      <div class="header-titles">
        <h1 class="page-title">{{ title }}</h1>
        <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: var(--so-font-xl);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: var(--so-font-sm);
      color: var(--so-text-muted);
      margin-top: 4px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
}
