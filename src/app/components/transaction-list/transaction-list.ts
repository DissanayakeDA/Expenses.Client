import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList {
  transactions: Transaction[] = [
    {
      id: 1,
      type: 'Income',
      category: 'Salary',
      amount: 5000,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      type: 'Expense',
      category: 'Groceries',
      amount: 200,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    // Add more transactions as needed
  ];
}
