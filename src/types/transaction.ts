
export interface Transaction {
  id: string;
  type: 'earning' | 'cashout' | 'bank-transfer' | 'venmo-transfer' | 'investment' | 'donation';
  amount: number;
  description: string;
  date: string;
}
