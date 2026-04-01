import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { SupabaseService } from '@app/services/supabase.service';
import { RecipeService } from '@app/services/recipe.service';
import { RecipeWithDetails } from '@app/models';

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
    IonNote,
  ],
})
export class HomePage implements OnInit {
  private supabase = inject(SupabaseService);
  private recipeService = inject(RecipeService);
  private router = inject(Router);

  recipes = signal<RecipeWithDetails[]>([]);

  constructor() {
    addIcons({ logOutOutline });
  }

  async ngOnInit() {
    const recipes = await this.recipeService.getRecipes();
    this.recipes.set(recipes);
  }

  async openRecipe(id: string) {
    await this.router.navigateByUrl(`/recipes/${id}`);
  }

  async logout() {
    await this.supabase.signOut();
    await this.router.navigateByUrl('/auth/login');
  }
}
