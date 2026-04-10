import { Component, input, model } from '@angular/core';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';
import {
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/angular/standalone';
import { CreateProfile, createProfileSchema } from '@types';

// TODO: Add Avatar URL support

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [FormField, IonInput, IonTextarea, IonItem, IonLabel, IonList, IonListHeader],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
})
export class ProfileFormComponent {
  public readonly value = model.required<CreateProfile>();
  public readonly formName = input('Profile Info');
  public readonly form = form(this.value, (p) => {
    validateStandardSchema(p, createProfileSchema);
  });
}
