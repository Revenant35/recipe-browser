import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, logOutOutline } from 'ionicons/icons';
import { SupabaseService } from '@app/services/supabase.service';
import { RecipeService } from '@app/services/recipe.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonSpinner,
  ],
})
export class HomePage implements ViewWillEnter {
  private readonly supabase = inject(SupabaseService);
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  protected searchQuery = signal('');

  protected recipesResource = resource({
    loader: () => this.recipeService.getRecipes(),
  });

  protected filteredRecipes = computed(() => {
    const recipes = this.recipesResource.value() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return recipes;
    return recipes.filter((r) => r.name.toLowerCase().includes(query));
  });

  constructor() {
    addIcons({ addOutline, logOutOutline });
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

  protected async logout() {
    await this.supabase.signOut();
    await this.router.navigateByUrl('/auth/login');
  }
}
