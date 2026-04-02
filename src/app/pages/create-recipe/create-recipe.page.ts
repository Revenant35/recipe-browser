import { Component, inject, viewChild } from '@angular/core';
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
import { firstValueFrom } from 'rxjs';

import { SupabaseService } from '@app/services/supabase.service';
import { RecipeService } from '@app/services/recipe.service';
import {
  RecipeFormComponent,
  RecipeFormValue,
} from '@app/forms/recipe-form/recipe-form.component';

@Component({
  selector: 'app-create-recipe',
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
  templateUrl: './create-recipe.page.html',
  styleUrl: './create-recipe.page.scss',
})
export class CreateRecipePage {
  private supabase = inject(SupabaseService);
  private recipeService = inject(RecipeService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  private recipeForm = viewChild<RecipeFormComponent>('recipeForm');

  protected async submit(value: RecipeFormValue) {
    try {
      const session = await firstValueFrom(this.supabase.session$);
      if (!session?.user) {
        throw new Error('You must be logged in to create a recipe.');
      }

      const recipeId = await this.recipeService.createRecipe({
        ...value,
        user_id: session.user.id,
      });

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
      this.recipeForm()?.resetLoading();
    }
  }
}
