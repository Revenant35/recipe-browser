import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase.service';
import { RecipeService } from '../services/recipe.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
})
export class HomePage implements OnInit {
  private supabase = inject(SupabaseService);
  private recipeService = inject(RecipeService);
  private router = inject(Router);

  constructor() {
    addIcons({ logOutOutline });
  }

  async ngOnInit() {
    const recipes = await this.recipeService.getRecipes();
    console.log('Recipes:', recipes);
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigateByUrl('/auth/login');
  }
}
