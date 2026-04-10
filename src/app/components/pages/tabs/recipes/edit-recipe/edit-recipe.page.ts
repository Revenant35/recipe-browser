import { Component, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { RecipeService } from '@services/recipe.service';
import { Recipe } from '@types';
import {
  RecipeFormComponent,
  RecipeFormValue,
} from '@app/components/forms/recipe-form/recipe-form.component';

@Component({
  selector: 'app-edit-recipe',
  standalone: true,
  imports: [
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
  private recipeForm = viewChild<RecipeFormComponent>('recipeForm');

  protected async submit(value: RecipeFormValue) {
    try {
      await this.recipeService.updateRecipe({
        id: this.recipe().id,
        ...value,
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
      this.recipeForm()?.resetLoading();
    }
  }
}
