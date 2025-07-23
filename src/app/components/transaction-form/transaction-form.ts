import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css',
})
export class TransactionForm implements OnInit {
  transactionForm: FormGroup;
  incomeCategories = ['Salary', 'Investment', 'Freelance'];
  expenseCategories = [
    'Food',
    'Transport',
    'Utilities',
    'Entertainment',
    'Health',
  ];

  avalableCategories: string[] = [];

  editMode = false;
  transactionId?: number;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {
    this.transactionForm = this.fb.group({
      type: ['', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      createAt: [new Date().toISOString().split('T')[0], Validators.required],
    });
  }
  ngOnInit(): void {
    // Debug: Check current authentication state
    console.log('=== AUTHENTICATION DEBUG ===');
    console.log('Is authenticated:', this.authService.isAuthenticated());
    console.log('Token exists:', !!this.authService.getToken());
    console.log('User ID:', this.authService.getUserId());
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('========================');

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const type = this.transactionForm.get('type')?.value;
    // Only set categories if a type is actually selected
    if (type) {
      this.avalableCategories =
        type === 'Expenses' ? this.expenseCategories : this.incomeCategories;
    } else {
      // Start with empty categories until user selects a type
      this.avalableCategories = [];
    }
    this.transactionForm.patchValue({ category: '' });
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.transactionId = +id;
      this.loadTransaction(this.transactionId);
    }
  }

  onTypeChange(): void {
    const type = this.transactionForm.get('type')?.value;
    this.avalableCategories =
      type === 'Expenses' ? this.expenseCategories : this.incomeCategories;
    this.transactionForm.patchValue({ category: '' });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      // Debug authentication and user ID
      console.log('Is authenticated:', this.authService.isAuthenticated());
      console.log('Current token:', this.authService.getToken());
      console.log('User ID:', this.authService.getUserId());
      console.log('Current user:', this.authService.getCurrentUser());

      // Check authentication before submitting
      if (!this.authService.isAuthenticated()) {
        this.errorMessage = 'Your session has expired. Please log in again.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';

      console.log('Form submitted:', this.transactionForm.value);

      if (this.editMode && this.transactionId) {
        // Update existing transaction
        this.transactionService
          .update(this.transactionId, this.transactionForm.value)
          .subscribe({
            next: (response) => {
              console.log('Transaction updated successfully:', response);
              this.router.navigate(['/transactions']);
            },
            error: (error) => {
              console.error('Error updating transaction:', error);
              this.handleError(error);
            },
          });
        return;
      }

      // Call the transaction service to save the transaction
      this.transactionService.create(this.transactionForm.value).subscribe({
        next: (response) => {
          console.log('Transaction created successfully:', response);
          this.router.navigate(['/transactions']);
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.handleError(error);
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.transactionForm.controls).forEach((key) => {
        this.transactionForm.get(key)?.markAsTouched();
      });
    }
  }

  private handleError(error: any): void {
    this.isSubmitting = false;

    if (error.message && error.message.includes('not authenticated')) {
      this.errorMessage = 'Authentication expired. Redirecting to login...';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else if (error.status === 401) {
      this.errorMessage = 'Authentication failed. Please log in again.';
      setTimeout(() => {
        this.authService.logout();
      }, 2000);
    } else {
      this.errorMessage =
        'An error occurred while saving the transaction. Please try again.';
    }
  }

  loadTransaction(id: number): void {
    this.transactionService.getById(id).subscribe({
      next: (transaction) => {
        // Handle date conversion properly
        let dateValue: string;
        if (transaction.createAt instanceof Date) {
          dateValue = transaction.createAt.toISOString().split('T')[0];
        } else {
          // If it's already a string, parse it to Date first then format
          dateValue = new Date(transaction.createAt)
            .toISOString()
            .split('T')[0];
        }

        // First populate categories based on transaction type
        this.avalableCategories =
          transaction.type === 'Expenses'
            ? this.expenseCategories
            : this.incomeCategories;

        // Then set form values including the category
        this.transactionForm.patchValue({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          createAt: dateValue,
        });
      },
      error: (error) => {
        console.error('Error fetching transaction:', error);
      },
    });
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
