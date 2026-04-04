import { Component, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logInOutline } from 'ionicons/icons';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonSpinner, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  protected loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  protected loading = signal(false);

  constructor() {
    addIcons({ logInOutline });
  }

  protected async submit(): Promise<void> {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.loading.set(true);
    const { error } = await this.auth.signIn(email!.trim(), password!);
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

    await this.router.navigateByUrl('/recipes');
  }
}
