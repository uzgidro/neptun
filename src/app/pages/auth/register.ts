import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    template: `
    <div class="register-container">
      <h2>Регистрация</h2>
      <form (ngSubmit)="onSubmit()">
        <label for="name">Логин:</label>
        <input type="text" id="name" [(ngModel)]="name" name="name" required />

        <label for="password">Пароль:</label>
        <input type="password" id="password" [(ngModel)]="password" name="password" required />

        <label for="confirm">Подтвердите пароль:</label>
        <input type="password" id="confirm" [(ngModel)]="confirmPassword" name="confirmPassword" required />

        <button type="submit">Зарегистрироваться</button>
      </form>

      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
    styles: [`
    .register-container {
      max-width: 400px;
      margin: auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    input {
      display: block;
      width: 100%;
      margin-bottom: 12px;
      padding: 8px;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
    }
    .error {
      color: red;
      margin-top: 10px;
    }
  `]
})
export class Register {
    name = '';
    password = '';
    confirmPassword = '';
    errorMessage = '';

    constructor(private http: HttpClient, private router: Router) {}

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Пароли не совпадают';
            return;
        }

        // Mock registration - simulate successful registration
        setTimeout(() => {
            alert('Регистрация успешна! Теперь войдите в систему.');
            this.router.navigate(['/auth/login']);
        }, 500);
    }
}
