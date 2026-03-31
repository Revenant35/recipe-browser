import { Component, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonSpinner, ReactiveFormsModule],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private supabase = inject(SupabaseService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  protected passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });
  protected loading = signal(false);

  constructor() {
    addIcons({ lockClosedOutline });
  }

  protected passwordsMatch(): boolean {
    return this.passwordForm.value.password === this.passwordForm.value.confirmPassword;
  }

  protected async submit(): Promise<void> {
    if (this.passwordForm.invalid || !this.passwordsMatch()) return;

    const { password } = this.passwordForm.value;
    this.loading.set(true);
    const { error } = await this.supabase.updatePassword(password!);
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
    await this.router.navigate(['/home']);
  }
}
