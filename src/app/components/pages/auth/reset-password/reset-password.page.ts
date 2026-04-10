import { Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { AuthService } from '@services/auth.service';
import {
  ResetPasswordFormComponent,
  ResetPasswordFormValue,
  resetPasswordSchema,
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

  protected formModel = signal<ResetPasswordFormValue>({ password: '', confirmPassword: '' });
  protected isSubmitting = signal(false);

  public readonly form = form(this.formModel, (p) => {
    validateStandardSchema(p, resetPasswordSchema);
  });

  protected canSubmit = computed(() => this.form().valid());

  constructor() {
    addIcons({ lockClosedOutline });
  }

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    const { password } = this.formModel();

    this.isSubmitting.set(true);

    try {
      const { error } = await this.auth.updatePassword(password);
      if (error) {
        throw error;
      }

      const toast = await this.toastCtrl.create({
        message: 'Password updated successfully.',
        duration: 3000,
      });
      await toast.present();
      await this.router.navigate(['/saved']);
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      const toast = await this.toastCtrl.create({
        message: e.message,
        duration: 5000,
        color: 'danger',
      });

      await toast.present();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
