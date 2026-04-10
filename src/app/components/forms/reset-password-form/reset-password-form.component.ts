import { Component, model } from '@angular/core';
import { z } from 'zod';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/standalone';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValue = z.infer<typeof resetPasswordSchema>;

@Component({
  selector: 'app-reset-password-form',
  imports: [FormField, IonInput],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.scss',
})
export class ResetPasswordFormComponent {
  public readonly form = model.required<FieldTree<ResetPasswordFormValue>>();
}
