import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonList,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, bookmark, bookmarkOutline } from 'ionicons/icons';
import { RecipeService } from '@services/recipe.service';

@Component({
  selector: 'app-saved',
  templateUrl: 'saved.page.html',
  styleUrls: ['saved.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonList,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonSpinner,
  ],
})
export class SavedPage {
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  protected searchQuery = signal('');

  protected recipesResource = rxResource({
    stream: () => this.recipeService.recipes$,
  });

  protected filteredRecipes = computed(() => {
    const recipes = this.recipesResource.value() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return recipes;
    return recipes.filter((r) => r.name.toLowerCase().includes(query));
  });

  constructor() {
    addIcons({ addOutline, bookmark, bookmarkOutline });
  }

  protected onSearch(event: CustomEvent) {
    this.searchQuery.set(event.detail.value ?? '');
  }

  protected async openRecipe(id: string) {
    await this.router.navigateByUrl(`/recipes/${id}`);
  }

  protected async createRecipe() {
    await this.router.navigateByUrl('/recipes/create');
  }
}
