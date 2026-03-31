import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
  standalone: false,
})
export class SignupPage {
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async onSignup() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const { error } = await this.supabase.signUp(this.email, this.password);
    if (error) {
      this.errorMessage = error.message;
    } else {
      this.router.navigateByUrl('/home');
    }
  }
}
