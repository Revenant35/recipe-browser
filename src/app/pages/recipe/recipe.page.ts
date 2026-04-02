import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
  IonAvatar,
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { RecipeWithDetails, Profile } from '@app/models';
import { RecipeService } from '@app/services/recipe.service';
import { SupabaseService } from '@app/services/supabase.service';

@Component({
  selector: 'app-recipe',
  templateUrl: 'recipe.page.html',
  styleUrls: ['recipe.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonChip,
    IonAvatar,
  ],
})
export class RecipePage implements OnInit {
  private supabase = inject(SupabaseService);
  private recipeService = inject(RecipeService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  recipe = input.required<RecipeWithDetails>();
  author = input.required<Profile>();

  protected isOwner = signal(false);

  totalTime = computed(() => {
    const prep = this.recipe()?.prep_time_minutes;
    const cook = this.recipe()?.cook_time_minutes;
    if (prep == null && cook == null) return null;
    return (prep ?? 0) + (cook ?? 0);
  });

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  async ngOnInit() {
    const session = await firstValueFrom(this.supabase.session$);
    this.isOwner.set(session?.user?.id === this.recipe().user_id);
  }

  async deleteRecipe() {
    const alert = await this.alertCtrl.create({
      header: 'Delete Recipe',
      message: 'Are you sure? This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.recipeService.deleteRecipe(this.recipe().id);
              this.router.navigate(['/home']);
            } catch {
              const toast = await this.toastCtrl.create({
                message: 'Failed to delete recipe.',
                duration: 3000,
                color: 'danger',
              });
              await toast.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
