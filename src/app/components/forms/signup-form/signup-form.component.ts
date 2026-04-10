import { Component, model } from '@angular/core';
import { z } from 'zod';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/standalone';

export const signupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignupFormValue = z.infer<typeof signupSchema>;

@Component({
  selector: 'app-signup-form',
  imports: [FormField, IonInput],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.scss',
})
export class SignupFormComponent {
  public readonly value = model.required<SignupFormValue>();

  public readonly form = form(this.value, (p) => {
    validateStandardSchema(p, signupSchema);
  });
}
