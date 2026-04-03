import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from '@app/services/supabase.service';
import { ProfileService } from '@app/services/profile.service';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
  ],
})
export class AccountPage implements OnInit {
  private supabase = inject(SupabaseService);
  private profileService = inject(ProfileService);
  private toastCtrl = inject(ToastController);

  protected loading = signal(true);
  protected saving = signal(false);

  protected profileForm = new FormGroup({
    full_name: new FormControl(''),
    username: new FormControl(''),
    website: new FormControl(''),
  });

  async ngOnInit() {
    const session = await firstValueFrom(this.supabase.session$);
    if (!session?.user) return;

    const profile = await this.profileService.getProfile(session.user.id);
    if (profile) {
      this.profileForm.patchValue({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        website: profile.website ?? '',
      });
    }
    this.loading.set(false);
  }

  protected async save() {
    const session = await firstValueFrom(this.supabase.session$);
    if (!session?.user) return;

    this.saving.set(true);
    try {
      await this.profileService.updateProfile(session.user.id, {
        full_name: this.profileForm.value.full_name ?? null,
        username: this.profileForm.value.username ?? null,
        website: this.profileForm.value.website ?? null,
      });
      this.profileForm.markAsPristine();
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
