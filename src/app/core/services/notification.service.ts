import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string, durationMs = 3500): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['so-snackbar-success']
    });
  }

  showError(message: string, durationMs = 5000): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['so-snackbar-error']
    });
  }

  showInfo(message: string, durationMs = 3500): void {
    this.snackBar.open(message, 'Close', {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['so-snackbar-info']
    });
  }
}
