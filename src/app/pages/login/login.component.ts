import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Component } from '@angular/core';
import { ISocialUser } from '../../models';
import { Router } from '@angular/router';
import { catchError, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoading = false;
  showInfo = false;
  errorMessage: string | null = null;

  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    private authService: AuthService
  ) {}

  signInWithGoogle(): void {
    this.isLoading = true;

    this.socialAuthService.authState
      .pipe(
        take(1),
        switchMap((user: ISocialUser | null) => {
          if (user && user.idToken) {
            this.authService.login(user.idToken);
            return this.router.navigate(['/']).then(() => user);
          } else {
            debugger
            this.errorMessage = 'Google giriş başarısız oldu. Lütfen tekrar deneyin.';
            return of(null);
          }
        }),
        catchError((error) => {
          debugger
          this.errorMessage = 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.';
          return of(null);
        })
      )
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  signInWithApple(){
    this.showInfo = true;
  }
}
