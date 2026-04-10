import { Component, input, model } from '@angular/core';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';
import {
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { ItemReorderEventDetail } from '@ionic/angular';
import { CreateRecipe, createRecipeSchema } from '@types';

@Component({
  selector: 'app-recipe-form',
  imports: [
    FormField,
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
  ],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
})
export class RecipeFormComponent {
  public readonly value = model.required<CreateRecipe>();
  public readonly formName = input('Recipe Info');

  public readonly form = form(this.value, (p) => {
    validateStandardSchema(p, createRecipeSchema);
  });

  constructor() {
    addIcons({ addOutline, trashOutline });
  }

  addIngredient() {
    this.value.update((v) => ({
      ...v,
      ingredients: [...v.ingredients, ''],
    }));
  }

  removeIngredient(index: number) {
    this.value.update((v) => ({
      ...v,
      ingredients: v.ingredients.filter((_, i) => i !== index),
    }));
  }

  reorderIngredients(event: CustomEvent<ItemReorderEventDetail>) {
    this.value.update((v) => {
      const items = [...v.ingredients];
      const [moved] = items.splice(event.detail.from, 1);
      items.splice(event.detail.to, 0, moved);
      return { ...v, ingredients: items };
    });
    event.detail.complete();
  }

  addInstruction() {
    this.value.update((v) => ({
      ...v,
      instructions: [...v.instructions, ''],
    }));
  }

  removeInstruction(index: number) {
    this.value.update((v) => ({
      ...v,
      instructions: v.instructions.filter((_, i) => i !== index),
    }));
  }

  reorderInstructions(event: CustomEvent<ItemReorderEventDetail>) {
    this.value.update((v) => {
      const items = [...v.instructions];
      const [moved] = items.splice(event.detail.from, 1);
      items.splice(event.detail.to, 0, moved);
      return { ...v, instructions: items };
    });
    event.detail.complete();
  }
}
