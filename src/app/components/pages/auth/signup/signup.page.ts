import { Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';
import { form, validateStandardSchema } from '@angular/forms/signals';
import { AuthService } from '@services/auth.service';
import {
  SignupFormComponent,
  SignupFormValue,
  signupSchema,
} from '@app/components/forms/signup-form/signup-form.component';

@Component({
  selector: 'app-signup',
  imports: [IonButton, IonIcon, IonSpinner, RouterLink, SignupFormComponent],
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.scss',
})
export class SignupPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  protected formModel = signal<SignupFormValue>({ email: '', password: '' });
  protected isSubmitting = signal(false);

  public readonly form = form(this.formModel, (p) => {
    validateStandardSchema(p, signupSchema);
  });

  protected canSubmit = computed(() => this.form().valid());

  constructor() {
    addIcons({ personAddOutline });
  }

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    const { email, password } = this.formModel();

    this.isSubmitting.set(true);

    try {
      const { error } = await this.auth.signUp(email.trim(), password);
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
