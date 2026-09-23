import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card" [ngClass]="{ 'stat-card-highlight': isHighlighted }">
      <div class="stat-header">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-icon-wrapper" [ngClass]="iconTheme">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
      </div>
      <div class="stat-body">
        <span class="stat-value">{{ value }}</span>
        <span *ngIf="badgeText" class="stat-badge" [ngClass]="badgeTheme">
          {{ badgeText }}
        </span>
      </div>
      <div *ngIf="subtext" class="stat-subtext">{{ subtext }}</div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--so-shadow-subtle);
      transition: all var(--so-transition-fast);

      &:hover {
        border-color: var(--so-border-strong);
        box-shadow: var(--so-shadow-sm);
      }

      &.stat-card-highlight {
        border-color: var(--so-primary-border);
        background: linear-gradient(180deg, var(--so-surface) 0%, var(--so-primary-50) 100%);
      }
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-label {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--so-text-muted);
    }

    .stat-icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: var(--so-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.theme-primary {
        background-color: var(--so-primary-light);
        color: var(--so-primary);
      }
      &.theme-success {
        background-color: #ECFDF5;
        color: #059669;
      }
      &.theme-warning {
        background-color: #FFFBEB;
        color: #D97706;
      }
      &.theme-info {
        background-color: #F1F5F9;
        color: #475569;
      }
    }

    .stat-body {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .stat-value {
      font-size: var(--so-font-2xl);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      line-height: 1.1;
      font-family: 'Roboto Mono', monospace;
    }

    .stat-badge {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      padding: 2px 6px;
      border-radius: var(--so-radius-sm);

      &.theme-success {
        background-color: #ECFDF5;
        color: #065F46;
      }
      &.theme-warning {
        background-color: #FFFBEB;
        color: #92400E;
      }
    }

    .stat-subtext {
      font-size: var(--so-font-xs);
      color: var(--so-text-muted);
      line-height: 1.3;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() icon = 'analytics';
  @Input() subtext?: string;
  @Input() badgeText?: string;
  @Input() badgeTheme: 'theme-success' | 'theme-warning' = 'theme-success';
  @Input() iconTheme: 'theme-primary' | 'theme-success' | 'theme-warning' | 'theme-info' = 'theme-primary';
  @Input() isHighlighted = false;
}
