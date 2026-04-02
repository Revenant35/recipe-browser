import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonReorderGroup,
  IonReorder,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, saveOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { ItemReorderEventDetail } from '@ionic/angular';

import { SupabaseService } from '@app/services/supabase.service';
import { RecipeService } from '@app/services/recipe.service';
import { RecipeDifficulty } from '@app/models';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonReorderGroup,
    IonReorder,
    IonSpinner,
  ],
  templateUrl: './create-recipe.page.html',
  styleUrl: './create-recipe.page.scss',
})
export class CreateRecipePage implements OnInit {
  private supabase = inject(SupabaseService);
  private recipeService = inject(RecipeService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  protected loading = signal(false);
  protected difficulties = signal<RecipeDifficulty[]>([]);

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    source: new FormControl(''),
    servings: new FormControl<number | null>(null),
    prep_time_minutes: new FormControl<number | null>(null),
    cook_time_minutes: new FormControl<number | null>(null),
    difficulty: new FormControl(''),
    ingredients: new FormArray<FormControl<string>>([]),
    instructions: new FormArray<FormControl<string>>([]),
    calories: new FormControl<number | null>(null),
    protein_grams: new FormControl<number | null>(null),
    carbs_grams: new FormControl<number | null>(null),
    fat_grams: new FormControl<number | null>(null),
  });

  constructor() {
    addIcons({ addOutline, trashOutline, saveOutline });
  }

  async ngOnInit() {
    const difficulties = await this.recipeService.getDifficulties();
    this.difficulties.set(difficulties);
  }

  get ingredients() {
    return this.form.controls.ingredients;
  }

  get instructions() {
    return this.form.controls.instructions;
  }

  addIngredient() {
    this.ingredients.push(new FormControl('', { nonNullable: true }));
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  reorderIngredients(event: CustomEvent<ItemReorderEventDetail>) {
    const from = event.detail.from;
    const to = event.detail.to;
    const control = this.ingredients.at(from);
    this.ingredients.removeAt(from);
    this.ingredients.insert(to, control);
    event.detail.complete();
  }

  addInstruction() {
    this.instructions.push(new FormControl('', { nonNullable: true }));
  }

  removeInstruction(index: number) {
    this.instructions.removeAt(index);
  }

  reorderInstructions(event: CustomEvent<ItemReorderEventDetail>) {
    const from = event.detail.from;
    const to = event.detail.to;
    const control = this.instructions.at(from);
    this.instructions.removeAt(from);
    this.instructions.insert(to, control);
    event.detail.complete();
  }

  protected async submit() {
    if (this.form.invalid) return;

    this.loading.set(true);

    try {
      const session = await firstValueFrom(this.supabase.session$);
      if (!session?.user) {
        throw new Error('You must be logged in to create a recipe.');
      }

      const v = this.form.value;
      const recipeId = await this.recipeService.createRecipe({
        name: v.name!,
        description: v.description!,
        user_id: session.user.id,
        source: v.source || undefined,
        servings: v.servings ?? undefined,
        prep_time_minutes: v.prep_time_minutes ?? undefined,
        cook_time_minutes: v.cook_time_minutes ?? undefined,
        difficulty: v.difficulty || undefined,
        calories: v.calories ?? undefined,
        protein_grams: v.protein_grams ?? undefined,
        carbs_grams: v.carbs_grams ?? undefined,
        fat_grams: v.fat_grams ?? undefined,
        ingredients: v.ingredients?.filter((i) => i?.trim()) as string[],
        instructions: v.instructions?.filter((i) => i?.trim()) as string[],
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
      this.loading.set(false);
    }
  }
}
