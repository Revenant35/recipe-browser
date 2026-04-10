import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { AuthService } from '@services/auth.service';
import { ProfileService } from '@services/profile.service';
import { CreateProfile } from '@types';
import { ProfileFormComponent } from '@app/components/forms/profile-form/profile-form.component';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonSpinner,
    ProfileFormComponent,
  ],
})
export class AccountPage implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private toastCtrl = inject(ToastController);

  private profileForm = viewChild.required<ProfileFormComponent>('profileForm');

  protected profileModel = signal<CreateProfile>({
    username: '',
    full_name: '',
    bio: '',
  });
  protected loading = signal(true);
  protected saving = signal(false);

  async ngOnInit() {
    const session = await firstValueFrom(this.auth.session$);
    if (!session?.user) return;

    const profile = await this.profileService.getProfile(session.user.id);
    if (profile) {
      this.profileModel.set({
        username: profile.username ?? '',
        full_name: profile.full_name ?? '',
        bio: profile.bio ?? '',
      });
    }
    this.loading.set(false);
  }

  protected async save() {
    if (this.profileForm().form().invalid()) return;

    const session = await firstValueFrom(this.auth.session$);
    if (!session?.user) return;

    this.saving.set(true);
    try {
      await this.profileService.updateProfile({
        id: session.user.id,
        updated_at: null,
        avatar_url: null,
        badge: null,
        wallpaper: null,
        ...this.profileModel(),
      });
      const toast = await this.toastCtrl.create({
        message: 'Profile updated',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Failed to update profile.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.saving.set(false);
    }
  }
}
