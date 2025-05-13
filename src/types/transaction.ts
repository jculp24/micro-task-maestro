
export interface Transaction {
  id: string;
  type: 'earning' | 'cashout';
  amount: number;
  description: string;
  date: string;
}
