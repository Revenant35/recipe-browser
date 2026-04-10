import { Component, inject, signal, viewChild } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logInOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';
import {
  LoginFormComponent,
  LoginFormValue,
} from '@app/components/forms/login-form/login-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonButton, IonIcon, IonSpinner, RouterLink, LoginFormComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  private loginForm = viewChild.required<LoginFormComponent>('loginForm');

  protected loginModel = signal<LoginFormValue>({ email: '', password: '' });
  protected loading = signal(false);

  constructor() {
    addIcons({ logInOutline });
  }

  protected async submit(): Promise<void> {
    if (!this.loginForm().form().valid()) return;

    const { email, password } = this.loginModel();
    this.loading.set(true);
    const { error } = await this.auth.signIn(email.trim(), password);
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
