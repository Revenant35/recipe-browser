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
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-more',
  templateUrl: 'more.page.html',
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  ],
})
export class MorePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ logOutOutline, personOutline });
  }

  protected async logout() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/auth/login');
  }
}
