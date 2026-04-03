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
  IonAvatar,
  IonIcon,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from '@app/services/supabase.service';
import { ProfileService } from '@app/services/profile.service';
import { AttachmentService } from '@app/services/attachment.service';

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
    IonAvatar,
    IonIcon,
  ],
})
export class AccountPage implements OnInit {
  private supabase = inject(SupabaseService);
  private profileService = inject(ProfileService);
  private attachmentService = inject(AttachmentService);
  private toastCtrl = inject(ToastController);

  protected loading = signal(true);
  protected saving = signal(false);
  protected avatarUrl = signal<string | null>(null);
  protected uploadingAvatar = signal(false);

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
      this.avatarUrl.set(profile.avatar_url);
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

  protected async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const session = await firstValueFrom(this.supabase.session$);
    if (!session?.user) return;

    this.uploadingAvatar.set(true);
    try {
      const url = await this.attachmentService.uploadAvatar(session.user.id, file);
      await this.profileService.updateProfile(session.user.id, {
        full_name: this.profileForm.value.full_name ?? null,
        username: this.profileForm.value.username ?? null,
        website: this.profileForm.value.website ?? null,
        avatar_url: url,
      });
      this.avatarUrl.set(url);
      const toast = await this.toastCtrl.create({
        message: 'Avatar updated',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Failed to upload avatar.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.uploadingAvatar.set(false);
      input.value = '';
    }
  }
}
