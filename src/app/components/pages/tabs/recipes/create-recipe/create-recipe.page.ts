import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { RecipeService } from '@services/recipe.service';
import { CreateRecipe } from '@types';
import { RecipeFormComponent } from '@app/components/forms/recipe-form/recipe-form.component';

@Component({
  selector: 'app-create-recipe',
  imports: [
    IonButton,
    IonIcon,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    RecipeFormComponent,
  ],
  templateUrl: './create-recipe.page.html',
})
export class CreateRecipePage {
  private auth = inject(AuthService);
  private recipeService = inject(RecipeService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  private recipeForm = viewChild.required<RecipeFormComponent>('recipeForm');

  protected recipeModel = signal<CreateRecipe>({
    name: '',
    description: '',
    source: null,
    servings: null,
    prep_time_minutes: null,
    cook_time_minutes: null,
    difficulty: null,
    calories: null,
    protein_grams: null,
    carbs_grams: null,
    fat_grams: null,
    ingredients: [],
    instructions: [],
  });
  protected loading = signal(false);

  constructor() {
    addIcons({ saveOutline });
  }

  protected async submit() {
    if (this.recipeForm().form().invalid()) return;

    this.loading.set(true);
    try {
      const session = await firstValueFrom(this.auth.session$);
      if (!session?.user) {
        throw new Error('You must be logged in to create a recipe.');
      }

      const recipeId = await this.recipeService.createRecipe(this.recipeModel());

      // Auto-save the user's own recipe to their saved list
      await this.recipeService.saveRecipe(session.user.id, recipeId);

      const toast = await this.toastCtrl.create({
        message: 'Recipe created!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
      await this.router.navigateByUrl(`/recipes/${recipeId}`);
    } catch (err: any) {
      const toast = await this.toastCtrl.create({
        message: err?.message ?? 'Failed to create recipe.',
        duration: 5000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
    }
  }
}
