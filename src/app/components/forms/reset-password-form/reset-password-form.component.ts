import { Component, model } from '@angular/core';
import { z } from 'zod';
import { form, FormField, validate, validateStandardSchema } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/standalone';

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
});

export type ResetPasswordFormValue = z.infer<typeof resetPasswordSchema>;

@Component({
  selector: 'app-reset-password-form',
  imports: [FormField, IonInput],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.scss',
})
export class ResetPasswordFormComponent {
  public readonly value = model.required<ResetPasswordFormValue>();

  public readonly form = form(this.value, (p) => {
    validateStandardSchema(p, resetPasswordSchema);
    validate(p.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(p.password)) {
        return { kind: 'mismatch', message: 'Passwords do not match' };
      }
      return null;
    });
  });
}
