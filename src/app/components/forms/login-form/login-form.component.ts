import { Component, model } from '@angular/core';
import { z } from 'zod';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/standalone';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValue = z.infer<typeof loginSchema>;

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormField, IonInput],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  public readonly form = model.required<FieldTree<LoginFormValue>>();
}
