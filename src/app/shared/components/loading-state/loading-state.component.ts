import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <mat-spinner diameter="36"></mat-spinner>
      <p class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 16px;
      width: 100%;
    }

    .loading-message {
      font-size: var(--so-font-sm);
      color: var(--so-text-muted);
      font-weight: var(--so-fw-medium);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingStateComponent {
  @Input() message = 'Loading transit data...';
}
