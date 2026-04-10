import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
import { RecipeService } from '@services/recipe.service';
import { AuthService } from '@services/auth.service';
import { firstValueFrom } from 'rxjs';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Recipe } from '@types';

@Component({
  selector: 'app-explore',
  templateUrl: 'explore.page.html',
  styleUrls: ['explore.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonButton,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class ExplorePage implements ViewWillEnter {
  private readonly recipeService = inject(RecipeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly PAGE_SIZE = 20;

  protected recipes = signal<Recipe[]>([]);
  protected totalCount = signal(0);
  protected isLoading = signal(false);
  protected searchQuery = signal('');
  protected savedIds = signal<Set<string>>(new Set());
  private currentPage = 0;

  constructor() {
    addIcons({ bookmark, bookmarkOutline });
  }

  async ionViewWillEnter() {
    await this.loadInitial();
  }

  protected async onSearch(event: CustomEvent) {
    this.searchQuery.set(event.detail.value ?? '');
    await this.loadInitial();
  }

  private async loadInitial() {
    this.isLoading.set(true);
    this.currentPage = 0;
    try {
      const [result, savedIds] = await Promise.all([
        this.recipeService.exploreRecipes(this.searchQuery(), 0, this.PAGE_SIZE),
        this.recipeService.getSavedRecipeIds(),
      ]);
      this.recipes.set(result.items);
      this.totalCount.set(result.count);
      this.savedIds.set(savedIds);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async loadMore(event: InfiniteScrollCustomEvent) {
    this.currentPage++;
    const result = await this.recipeService.exploreRecipes(
      this.searchQuery(),
      this.currentPage,
      this.PAGE_SIZE,
    );
    this.recipes.update((prev) => [...prev, ...result.items]);
    await event.target.complete();

    if (this.recipes().length >= this.totalCount()) {
      event.target.disabled = true;
    }
  }

  protected isSaved(recipeId: string): boolean {
    return this.savedIds().has(recipeId);
  }

  protected async toggleSave(event: Event, recipeId: string) {
    event.stopPropagation();
    const session = await firstValueFrom(this.auth.session$);
    if (!session?.user) return;

    if (this.isSaved(recipeId)) {
      await this.recipeService.unsaveRecipe(recipeId);
      this.savedIds.update((ids) => {
        const next = new Set(ids);
        next.delete(recipeId);
        return next;
      });
    } else {
      await this.recipeService.saveRecipe(session.user.id, recipeId);
      this.savedIds.update((ids) => {
        const next = new Set(ids);
        next.add(recipeId);
        return next;
      });
    }
  }

  protected async openRecipe(id: string) {
    await this.router.navigateByUrl(`/recipes/${id}`);
  }
}
