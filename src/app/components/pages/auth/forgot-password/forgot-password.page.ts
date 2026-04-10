import { Component, inject, signal, viewChild } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';
import {
  ForgotPasswordFormComponent,
  ForgotPasswordFormValue,
} from '@app/components/forms/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [IonButton, IonIcon, IonSpinner, RouterLink, ForgotPasswordFormComponent],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);

  private forgotForm = viewChild.required<ForgotPasswordFormComponent>('forgotForm');

  protected emailModel = signal<ForgotPasswordFormValue>({ email: '' });
  protected loading = signal(false);
  protected sent = signal(false);

  constructor() {
    addIcons({ mailOutline });
  }

  protected async submit(): Promise<void> {
    if (this.forgotForm().form().invalid()) return;

    const { email } = this.emailModel();
    this.loading.set(true);
    const { error } = await this.auth.resetPasswordForEmail(email.trim());
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

    this.sent.set(true);
  }
}
