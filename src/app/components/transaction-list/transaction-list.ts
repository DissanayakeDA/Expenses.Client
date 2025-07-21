import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction';
import { TransactionService } from '../../services/transaction.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList implements OnInit {
  transactions: Transaction[] = [];

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.loadTransactions();
  }
  loadTransactions(): void {
    this.transactionService
      .getAll()
      .subscribe((data) => (this.transactions = data));
  }
  getTotalExpenses(): number {
    return this.transactions
      .filter((t) => t.type === 'Expenses')
      .reduce((total, t) => total + t.amount, 0);
  }
  getTotalIncome(): number {
    return this.transactions
      .filter((t) => t.type === 'Income')
      .reduce((total, t) => total + t.amount, 0);
  }
  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
  editTransaction(transaction: Transaction) {
    if (transaction.id) {
      this.router.navigate(['/edit/', transaction.id]);
    }
  }
}
