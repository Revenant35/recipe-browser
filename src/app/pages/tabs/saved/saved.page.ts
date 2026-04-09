import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
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
import { RecipeService } from '@app/services/recipe.service';

@Component({
  selector: 'app-saved',
  templateUrl: 'saved.page.html',
  styleUrls: ['saved.page.scss'],
  standalone: true,
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
export class SavedPage implements ViewWillEnter {
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  protected searchQuery = signal('');

  protected recipesResource = resource({
    loader: () => this.recipeService.getSavedRecipes(),
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

  public ionViewWillEnter() {
    this.recipesResource.reload();
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
