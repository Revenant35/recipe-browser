import { Component, effect, inject, input, signal, viewChild } from '@angular/core';
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
import { RecipeService } from '@services/recipe.service';
import { Recipe, CreateRecipe } from '@types';
import { RecipeFormComponent } from '@app/components/forms/recipe-form/recipe-form.component';

@Component({
  selector: 'app-edit-recipe',
  standalone: true,
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
  templateUrl: './edit-recipe.page.html',
})
export class EditRecipePage {
  private recipeService = inject(RecipeService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  recipe = input.required<Recipe>();
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

    effect(() => {
      const r = this.recipe();
      this.recipeModel.set({
        name: r.name,
        description: r.description,
        source: r.source,
        servings: r.servings,
        prep_time_minutes: r.prep_time_minutes,
        cook_time_minutes: r.cook_time_minutes,
        difficulty: r.difficulty,
        calories: r.calories,
        protein_grams: r.protein_grams,
        carbs_grams: r.carbs_grams,
        fat_grams: r.fat_grams,
        ingredients: r.ingredients.map((i) => i.value),
        instructions: r.instructions.map((i) => i.value),
      });
    });
  }

  protected async submit() {
    if (this.recipeForm().form().invalid()) return;

    this.loading.set(true);
    try {
      await this.recipeService.updateRecipe({
        id: this.recipe().id,
        ...this.recipeModel(),
      });

      const toast = await this.toastCtrl.create({
        message: 'Recipe updated!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
      await this.router.navigateByUrl(`/recipes/${this.recipe().id}`);
    } catch (err: any) {
      const toast = await this.toastCtrl.create({
        message: err?.message ?? 'Failed to update recipe.',
        duration: 5000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.loading.set(false);
    }
  }
}
