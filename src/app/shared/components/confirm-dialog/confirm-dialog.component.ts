import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => Observable<unknown>;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  isLoading = signal(false);

  confirm(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.data.onConfirm().subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.isLoading.set(false),
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
