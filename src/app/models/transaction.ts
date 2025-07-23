export interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  userId?: string; // Optional for create operations, required for loaded transactions
  createAt: Date;
  updatedAt: Date;
}
