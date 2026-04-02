import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { RecipeWithDetails, Profile } from '@app/models';
import { SupabaseService } from '@app/services/supabase.service';

@Component({
  selector: 'app-recipe',
  templateUrl: 'recipe.page.html',
  styleUrls: ['recipe.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonChip,
    IonAvatar,
  ],
})
export class RecipePage implements OnInit {
  private supabase = inject(SupabaseService);

  recipe = input.required<RecipeWithDetails>();
  author = input.required<Profile>();

  protected isOwner = signal(false);

  totalTime = computed(() => {
    const prep = this.recipe()?.prep_time_minutes;
    const cook = this.recipe()?.cook_time_minutes;
    if (prep == null && cook == null) return null;
    return (prep ?? 0) + (cook ?? 0);
  });

  constructor() {
    addIcons({ createOutline });
  }

  async ngOnInit() {
    const session = await firstValueFrom(this.supabase.session$);
    this.isOwner.set(session?.user?.id === this.recipe().user_id);
  }
}
