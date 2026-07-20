import { base44 } from '@/api/base44Client';

export async function awardTokens(amount, reason) {
  try {
    await base44.entities.TokenTransaction.create({ amount, type: 'earn', reason });
    const user = await base44.auth.me();
    const currentBalance = user.token_balance || 0;
    await base44.auth.updateMe({ token_balance: currentBalance + amount });
    return currentBalance + amount;
  } catch (e) {
    return null;
  }
}

export async function getTokenBalance() {
  try {
    const user = await base44.auth.me();
    return user.token_balance || 0;
  } catch (e) {
    return 0;
  }
}