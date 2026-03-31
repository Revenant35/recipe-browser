import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async logout() {
    await this.supabase.signOut();
    this.router.navigateByUrl('/login');
  }
}
