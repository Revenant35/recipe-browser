import { Component, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [IonButton, IonIcon, IonInput, IonSpinner, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.scss',
})
export class SignupPage {
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  protected signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
  protected loading = signal(false);

  constructor() {
    addIcons({ personAddOutline });
  }

  protected async submit(): Promise<void> {
    if (this.signupForm.invalid) return;

    const { email, password } = this.signupForm.value;
    this.loading.set(true);
    const { error } = await this.auth.signUp(email!.trim(), password!);
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
