
import { Transaction } from "@/types/transaction";

export const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    type: "earning",
    amount: 0.25,
    description: "Completed Swipe Task: Sneaker designs",
    date: "2025-05-13T10:35:00Z",
  },
  {
    id: "tx2",
    type: "earning",
    amount: 0.15,
    description: "Completed This/That Task: Food packaging",
    date: "2025-05-13T09:42:00Z",
  },
  {
    id: "tx3",
    type: "earning",
    amount: 0.50,
    description: "Completed Bracket Task: Travel destinations",
    date: "2025-05-12T16:20:00Z",
  },
  {
    id: "tx4",
    type: "earning",
    amount: 0.30,
    description: "Completed Higher/Lower Task: Smartphone prices",
    date: "2025-05-12T14:15:00Z",
  },
  {
    id: "tx5",
    type: "cashout",
    amount: 10.00,
    description: "Withdrawal to PayPal",
    date: "2025-05-10T11:30:00Z",
  },
  {
    id: "tx6",
    type: "earning",
    amount: 0.20,
    description: "Completed Sound Byte Task: Brand jingles",
    date: "2025-05-09T17:22:00Z",
  },
  {
    id: "tx7",
    type: "earning",
    amount: 0.35,
    description: "Completed Highlight Task: Ad campaign",
    date: "2025-05-09T15:40:00Z",
  },
  {
    id: "tx8",
    type: "earning",
    amount: 0.20,
    description: "Completed Swipe Task: Fitness app interfaces",
    date: "2025-05-08T13:10:00Z",
  },
  {
    id: "tx9",
    type: "earning",
    amount: 0.40,
    description: "Completed This/That Task: Investment app features",
    date: "2025-05-08T10:05:00Z",
  },
  {
    id: "tx10",
    type: "cashout",
    amount: 15.00,
    description: "Withdrawal to Bank Account",
    date: "2025-05-05T09:30:00Z",
  }
];
