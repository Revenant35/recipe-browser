import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  IonCheckbox,
  IonChip,
  IonAvatar,
} from '@ionic/angular/standalone';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline, clipboardOutline, createOutline, ellipsisHorizontal, trashOutline } from 'ionicons/icons';
import { Recipe, Profile } from '@types';
import { RecipeService } from '@services/recipe.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: 'recipe-details.page.html',
  standalone: true,
  imports: [
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
    IonCheckbox,
    IonChip,
    IonAvatar,
  ],
})
export class RecipeDetailsPage implements OnInit {
  private auth = inject(AuthService);
  private recipeService = inject(RecipeService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  recipe = input.required<Recipe>();
  author = input.required<Profile>();

  protected isOwner = signal(false);
  protected isSaved = signal(false);
  protected checkedIngredients = signal(new Set<string>());

  totalTime = computed(() => {
    const prep = this.recipe()?.prep_time_minutes;
    const cook = this.recipe()?.cook_time_minutes;
    if (prep == null && cook == null) return null;
    return (prep ?? 0) + (cook ?? 0);
  });

  constructor() {
    addIcons({ clipboardOutline, createOutline, ellipsisHorizontal, trashOutline });
  }

  async ngOnInit() {
    const [session, saved] = await Promise.all([
      firstValueFrom(this.auth.session$),
      this.recipeService.isRecipeSaved(this.recipe().id),
    ]);
    this.isOwner.set(session?.user?.id === this.recipe().user_id);
    this.isSaved.set(saved);
  }

  async toggleSave() {
    const session = await firstValueFrom(this.auth.session$);
    if (!session?.user) return;

    if (this.isSaved()) {
      await this.recipeService.unsaveRecipe(this.recipe().id);
      this.isSaved.set(false);
    } else {
      await this.recipeService.saveRecipe(session.user.id, this.recipe().id);
      this.isSaved.set(true);
    }
  }

  protected async copyIngredients() {
    const text = this.recipe()
      .ingredients.map((i) => i.value)
      .join('\n');
    await navigator.clipboard.writeText(text);
    const toast = await this.toastCtrl.create({
      message: 'Ingredients copied to clipboard',
      duration: 2000,
    });
    await toast.present();
  }

  protected toggleIngredient(id: string) {
    this.checkedIngredients.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async openActions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Recipe Actions',
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/recipes', this.recipe().id, 'edit']);
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.deleteRecipe();
          },
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await actionSheet.present();
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
              this.router.navigate(['/saved']);
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
