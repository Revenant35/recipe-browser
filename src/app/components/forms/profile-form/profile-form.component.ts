import { Component, model } from '@angular/core';
import { z } from 'zod';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IonInput, IonTextarea } from '@ionic/angular/standalone';

export const profileSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or fewer'),
  full_name: z.string().min(1, 'Full name is required'),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer'),
});

export type ProfileFormValue = z.infer<typeof profileSchema>;

@Component({
  selector: 'app-profile-form',
  imports: [FormField, IonInput, IonTextarea],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
})
export class ProfileFormComponent {
  public readonly form = model.required<FieldTree<ProfileFormValue>>();
}
