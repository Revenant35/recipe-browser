import { Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logInOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';
import {
  LoginFormComponent,
  LoginFormValue,
  loginSchema,
} from '@app/components/forms/login-form/login-form.component';
import { form, validateStandardSchema } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [IonButton, IonIcon, IonSpinner, RouterLink, LoginFormComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  protected formModel = signal<LoginFormValue>({ email: '', password: '' });
  protected isSubmitting = signal(false);

  public readonly form = form(this.formModel, (p) => {
    validateStandardSchema(p, loginSchema);
  });

  protected canSubmit = computed(() => this.form().valid());

  constructor() {
    addIcons({ logInOutline });
  }

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    const { email, password } = this.formModel();

    this.isSubmitting.set(true);

    try {
      const { error } = await this.auth.signIn(email.trim(), password);
      if (error) {
        throw error;
      }
      await this.router.navigateByUrl('/saved');
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
