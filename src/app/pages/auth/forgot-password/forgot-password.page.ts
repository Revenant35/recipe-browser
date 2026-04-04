import { Component, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonSpinner, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);

  protected emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  protected loading = signal(false);
  protected sent = signal(false);

  constructor() {
    addIcons({ mailOutline });
  }

  protected async submit(): Promise<void> {
    if (this.emailForm.invalid) return;

    const { email } = this.emailForm.value;
    this.loading.set(true);
    const { error } = await this.auth.resetPasswordForEmail(email!.trim());
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
