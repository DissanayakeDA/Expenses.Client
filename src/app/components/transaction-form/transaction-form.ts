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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute
  ) {
    this.transactionForm = this.fb.group({
      type: ['', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      createAt: [new Date().toISOString().split('T')[0], Validators.required],
    });
  }
  ngOnInit(): void {
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
        },
      });
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
