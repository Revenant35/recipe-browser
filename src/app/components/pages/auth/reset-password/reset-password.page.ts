import { Component, inject, signal, viewChild } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';
import {
  ResetPasswordFormComponent,
  ResetPasswordFormValue,
} from '@app/components/forms/reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-reset-password',
  imports: [IonButton, IonIcon, IonSpinner, ResetPasswordFormComponent],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  private resetForm = viewChild.required<ResetPasswordFormComponent>('resetForm');

  protected passwordModel = signal<ResetPasswordFormValue>({ password: '', confirmPassword: '' });
  protected loading = signal(false);

  constructor() {
    addIcons({ lockClosedOutline });
  }

  protected async submit(): Promise<void> {
    if (!this.resetForm().form().valid()) return;

    const { password } = this.passwordModel();
    this.loading.set(true);
    const { error } = await this.auth.updatePassword(password);
    this.loading.set(false);

    if (error) {
      const toast = await this.toastCtrl.create({
        message: error.message,
        duration: 5000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    const toast = await this.toastCtrl.create({
      message: 'Password updated successfully.',
      duration: 3000,
    });
    await toast.present();
    await this.router.navigate(['/saved']);
  }
}
