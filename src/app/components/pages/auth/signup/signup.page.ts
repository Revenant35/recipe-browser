import { Component, inject, signal, viewChild } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';
import {
  SignupFormComponent,
  SignupFormValue,
} from '@app/components/forms/signup-form/signup-form.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [IonButton, IonIcon, IonSpinner, RouterLink, SignupFormComponent],
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.scss',
})
export class SignupPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  private signupForm = viewChild.required<SignupFormComponent>('signupForm');

  protected signupModel = signal<SignupFormValue>({ email: '', password: '' });
  protected loading = signal(false);

  constructor() {
    addIcons({ personAddOutline });
  }

  protected async submit(): Promise<void> {
    if (this.signupForm().form().invalid()) return;

    const { email, password } = this.signupModel();
    this.loading.set(true);
    const { error } = await this.auth.signUp(email.trim(), password);
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

    await this.router.navigateByUrl('/saved');
  }
}
