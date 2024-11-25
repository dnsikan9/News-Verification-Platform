import { describe, it, expect, beforeEach } from 'vitest';

// Mock contract state
let stakes = new Map<string, number>();
const STAKE_AMOUNT = 1000000; // 1 STX

// Mock contract functions
const stake = (user: string) => {
  const currentStake = stakes.get(user) || 0;
  stakes.set(user, currentStake + STAKE_AMOUNT);
  return { type: 'ok', value: true };
};

const unstake = (user: string, amount: number) => {
  const currentStake = stakes.get(user) || 0;
  if (currentStake < amount) {
    return { type: 'err', value: 100 }; // ERR_INSUFFICIENT_BALANCE
  }
  stakes.set(user, currentStake - amount);
  return { type: 'ok', value: true };
};

const getStake = (user: string) => {
  return { type: 'ok', value: stakes.get(user) || 0 };
};

const slash = (user: string, amount: number) => {
  const currentStake = stakes.get(user) || 0;
  if (currentStake < amount) {
    return { type: 'err', value: 100 }; // ERR_INSUFFICIENT_BALANCE
  }
  stakes.set(user, currentStake - amount);
  return { type: 'ok', value: true };
};

describe('Staking Contract', () => {
  beforeEach(() => {
    stakes.clear();
  });
  
  it('should allow users to stake', () => {
    const result = stake('user1');
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    
    const stakeResult = getStake('user1');
    expect(stakeResult.type).toBe('ok');
    expect(stakeResult.value).toBe(STAKE_AMOUNT);
  });
  
  it('should allow users to stake multiple times', () => {
    stake('user2');
    stake('user2');
    
    const stakeResult = getStake('user2');
    expect(stakeResult.type).toBe('ok');
    expect(stakeResult.value).toBe(STAKE_AMOUNT * 2);
  });
  
  it('should allow users to unstake', () => {
    stake('user3');
    const unstakeResult = unstake('user3', STAKE_AMOUNT / 2);
    expect(unstakeResult.type).toBe('ok');
    expect(unstakeResult.value).toBe(true);
    
    const stakeResult = getStake('user3');
    expect(stakeResult.type).toBe('ok');
    expect(stakeResult.value).toBe(STAKE_AMOUNT / 2);
  });
  
  it('should not allow unstaking more than staked amount', () => {
    stake('user4');
    const unstakeResult = unstake('user4', STAKE_AMOUNT * 2);
    expect(unstakeResult.type).toBe('err');
    expect(unstakeResult.value).toBe(100); // ERR_INSUFFICIENT_BALANCE
  });
  
  it('should allow slashing of staked amount', () => {
    stake('user5');
    const slashResult = slash('user5', STAKE_AMOUNT / 2);
    expect(slashResult.type).toBe('ok');
    expect(slashResult.value).toBe(true);
    
    const stakeResult = getStake('user5');
    expect(stakeResult.type).toBe('ok');
    expect(stakeResult.value).toBe(STAKE_AMOUNT / 2);
  });
  
  it('should not allow slashing more than staked amount', () => {
    stake('user6');
    const slashResult = slash('user6', STAKE_AMOUNT * 2);
    expect(slashResult.type).toBe('err');
    expect(slashResult.value).toBe(100); // ERR_INSUFFICIENT_BALANCE
  });
  
  it('should maintain separate stakes for different users', () => {
    stake('user7');
    stake('user8');
    stake('user8');
    
    const stakeResult7 = getStake('user7');
    const stakeResult8 = getStake('user8');
    
    expect(stakeResult7.type).toBe('ok');
    expect(stakeResult7.value).toBe(STAKE_AMOUNT);
    
    expect(stakeResult8.type).toBe('ok');
    expect(stakeResult8.value).toBe(STAKE_AMOUNT * 2);
  });
});

