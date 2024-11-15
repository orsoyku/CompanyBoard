import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated: boolean = false;
  private userToken: string | null = null;

  constructor() {}

  login(token: string): void {
    debugger
    this.isAuthenticated = true;
    this.userToken = token;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userToken = null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated && this.userToken !== null;
  }

  getToken(): string | null {
    return this.userToken;
  }
}
