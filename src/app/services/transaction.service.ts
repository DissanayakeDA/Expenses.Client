import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Transaction } from '../models/transaction';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl =
    'https://expenseappda-f8cjdufedea3cfae.canadacentral-01.azurewebsites.net/api/Transactions';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl + '/All');
  }

  getUserTransactions(): Observable<Transaction[]> {
    // Alternative method to get only current user's transactions
    // Use this if your backend supports filtering by user ID automatically
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('User not authenticated. Please log in and try again.')
      );
    }

    return this.http.get<Transaction[]>(`${this.apiUrl}/User/${userId}`);
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(this.apiUrl + '/Details/' + id);
  }

  create(transaction: Transaction): Observable<Transaction> {
    // Set user ID from current authenticated user
    const userId = this.authService.getUserId();
    console.log('Creating transaction - User ID:', userId);
    console.log('Is authenticated:', this.authService.isAuthenticated());
    console.log('Token:', this.authService.getToken());

    if (!userId) {
      console.error('No user ID found when creating transaction');
      return throwError(
        () => new Error('User not authenticated. Please log in and try again.')
      );
    }

    const transactionWithUserId = {
      ...transaction,
      userId: userId,
    };

    console.log('Transaction data being sent:', transactionWithUserId);

    return this.http.post<Transaction>(
      this.apiUrl + '/Create',
      transactionWithUserId
    );
  }

  update(id: number, transaction: Transaction): Observable<Transaction> {
    // Ensure user ID is set for updates as well
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('User not authenticated. Please log in and try again.')
      );
    }

    const transactionWithUserId = {
      ...transaction,
      userId: userId,
    };

    return this.http.post<Transaction>(
      this.apiUrl + '/Update/' + id,
      transactionWithUserId
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/Delete/' + id);
  }
}
