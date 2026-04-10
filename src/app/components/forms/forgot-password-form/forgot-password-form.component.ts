import { Component, model } from '@angular/core';
import { z } from 'zod';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/standalone';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type ForgotPasswordFormValue = z.infer<typeof forgotPasswordSchema>;

@Component({
  selector: 'app-forgot-password-form',
  imports: [FormField, IonInput],
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss',
})
export class ForgotPasswordFormComponent {
  public readonly form = model.required<FieldTree<ForgotPasswordFormValue>>();
}
