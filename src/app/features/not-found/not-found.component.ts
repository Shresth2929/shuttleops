import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, EmptyStateComponent],
  template: `
    <div class="page-container not-found-wrapper">
      <div class="not-found-card">
        <div class="error-code font-mono">404</div>
        <h1 class="error-title">Operational Route Not Found</h1>
        <p class="error-desc">
          The requested dispatch console page or route does not exist or has been relocated.
        </p>
        <a routerLink="/overview" mat-flat-button class="btn-primary">
          <mat-icon>dashboard</mat-icon>
          <span>Return to Overview</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .not-found-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      padding: 48px;
      text-align: center;
      max-width: 480px;
      box-shadow: var(--so-shadow-subtle);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .error-code {
      font-size: 64px;
      font-weight: var(--so-fw-bold);
      color: var(--so-primary);
      line-height: 1;
    }

    .error-title {
      font-size: var(--so-font-lg);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      margin: 0;
    }

    .error-desc {
      font-size: var(--so-font-sm);
      color: var(--so-text-muted);
      line-height: 1.5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}
