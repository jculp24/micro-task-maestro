
import { Transaction } from "@/types/transaction";
import { 
  ArrowDownRight, 
  ArrowUpRight,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${transaction.type === 'earning' 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                : 'bg-bronze/10 text-bronze'}
            `}>
              {transaction.type === 'earning' 
                ? <ArrowDownRight size={18} /> 
                : <ArrowUpRight size={18} />
              }
            </div>
            
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className={`
            font-semibold
            ${transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' : 'text-bronze'}
          `}>
            {transaction.type === 'earning' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
