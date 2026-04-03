import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { SupabaseService } from '@app/services/supabase.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon],
})
export class SettingsPage {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ logOutOutline });
  }

  protected async logout() {
    await this.supabase.signOut();
    await this.router.navigateByUrl('/auth/login');
  }
}
