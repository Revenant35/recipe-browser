import { Component, computed, input } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
  IonAvatar,
} from '@ionic/angular/standalone';
import { RecipeWithDetails, Profile } from '@app/models';

@Component({
  selector: 'app-recipe',
  templateUrl: 'recipe.page.html',
  styleUrls: ['recipe.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonChip,
    IonAvatar,
  ],
})
export class RecipePage {
  recipe = input.required<RecipeWithDetails>();
  author = input.required<Profile>();

  totalTime = computed(() => {
    const prep = this.recipe()?.prep_time_minutes;
    const cook = this.recipe()?.cook_time_minutes;
    if (prep == null && cook == null) return null;
    return (prep ?? 0) + (cook ?? 0);
  });
}
