import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transaction-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css',
})
export class TransactionForm implements OnInit {
  newTransaction: Transaction = {
    id: 0,
    type: '',
    category: '',
    amount: 0,
    createAt: new Date(),
    updatedAt: new Date(),
  };

  incomeCategories = ['Salary', 'Investment', 'Freelance'];
  expenseCategories = [
    'Food',
    'Transport',
    'Utilities',
    'Entertainment',
    'Health',
  ];

  availableCategories: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.updateCategories();
  }

  updateCategories(): void {
    this.availableCategories =
      this.newTransaction.type === 'Expense'
        ? this.expenseCategories
        : this.incomeCategories;
    this.newTransaction.category = '';
  }

  addTransaction(): void {
    console.log('Adding transaction:', this.newTransaction);
    // TODO: Call the transaction service to save the transaction
  }
}
