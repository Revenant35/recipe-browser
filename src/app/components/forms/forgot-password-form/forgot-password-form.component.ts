import { Component, model } from '@angular/core';
import { z } from 'zod';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/standalone';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type ForgotPasswordFormValue = z.infer<typeof forgotPasswordSchema>;

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [FormField, IonInput],
  templateUrl: './forgot-password-form.component.html',
  styleUrl: './forgot-password-form.component.scss',
})
export class ForgotPasswordFormComponent {
  public readonly value = model.required<ForgotPasswordFormValue>();

  public readonly form = form(this.value, (p) => {
    validateStandardSchema(p, forgotPasswordSchema);
  });
}
