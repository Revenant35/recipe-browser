import { Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { AuthService } from '@services/auth.service';
import {
  ForgotPasswordFormComponent,
  ForgotPasswordFormValue,
  forgotPasswordSchema,
} from '@app/components/forms/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password',
  imports: [IonButton, IonIcon, IonSpinner, RouterLink, ForgotPasswordFormComponent],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);

  protected formModel = signal<ForgotPasswordFormValue>({ email: '' });
  protected isSubmitting = signal(false);
  protected sent = signal(false);

  public readonly form = form(this.formModel, (p) => {
    validateStandardSchema(p, forgotPasswordSchema);
  });

  protected canSubmit = computed(() => this.form().valid());

  constructor() {
    addIcons({ mailOutline });
  }

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    const { email } = this.formModel();

    this.isSubmitting.set(true);

    try {
      const { error } = await this.auth.resetPasswordForEmail(email.trim());
      if (error) {
        throw error;
      }
      this.sent.set(true);
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
