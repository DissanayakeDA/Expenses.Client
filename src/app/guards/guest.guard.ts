import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if user is authenticated using AuthService
  if (!authService.isAuthenticated()) {
    // Allow access if not authenticated (guest user)
    return true;
  } else {
    // Redirect to home page if already authenticated
    router.navigate(['/home']);
    return false;
  }
};
