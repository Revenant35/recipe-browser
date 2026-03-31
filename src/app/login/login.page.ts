import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async onLogin() {
    this.errorMessage = '';
    const { error } = await this.supabase.signIn(this.email, this.password);
    if (error) {
      this.errorMessage = error.message;
    } else {
      this.router.navigateByUrl('/home');
    }
  }
}
