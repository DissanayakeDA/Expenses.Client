import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl =
    'https://expenseappda-f8cjdufedea3cfae.canadacentral-01.azurewebsites.net/api/Auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: User): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.apiUrl + '/Login', credentials)
      .pipe(
        tap((response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  register(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + '/Register', user).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    // You can add token expiration check here if needed
    try {
      // Basic token validation - you can enhance this
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      // If token is malformed, consider it invalid
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload:', payload);
      console.log('Available fields:', Object.keys(payload));

      // Check all possible user ID fields
      const possibleFields = [
        'sub',
        'userId',
        'id',
        'nameid',
        'unique_name',
        'jti',
        'uid',
        'user_id',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      ];

      let userId = null;

      for (const field of possibleFields) {
        if (payload[field]) {
          userId = payload[field];
          console.log(`Found user ID in field '${field}':`, userId);
          break;
        }
      }

      if (!userId) {
        console.log('No user ID found in any expected field');
        console.log(
          'Full payload for manual inspection:',
          JSON.stringify(payload, null, 2)
        );
      }

      return userId;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.userId || payload.id || payload.nameid,
        email: payload.email || payload.unique_name,
        name: payload.name || payload.given_name,
        // Add other user properties as needed
      };
    } catch (error) {
      console.error('Error extracting user data from token:', error);
      return null;
    }
  }
}
