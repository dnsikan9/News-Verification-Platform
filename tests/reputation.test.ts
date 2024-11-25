import { describe, it, expect, beforeEach } from 'vitest';

// Mock contract state
let reputations = new Map<string, { score: number, totalVerifications: number, correctVerifications: number }>();

// Mock contract functions
const updateReputation = (user: string, isCorrect: boolean) => {
  const currentRep = reputations.get(user) || { score: 0, totalVerifications: 0, correctVerifications: 0 };
  const newRep = {
    score: currentRep.score + (isCorrect ? 1 : -1),
    totalVerifications: currentRep.totalVerifications + 1,
    correctVerifications: currentRep.correctVerifications + (isCorrect ? 1 : 0)
  };
  reputations.set(user, newRep);
  return { type: 'ok', value: true };
};

const getReputation = (user: string) => {
  const rep = reputations.get(user) || { score: 0, totalVerifications: 0, correctVerifications: 0 };
  return { type: 'ok', value: rep };
};

describe('Reputation Contract', () => {
  beforeEach(() => {
    reputations.clear();
  });
  
  it('should initialize a new user with zero reputation', () => {
    const result = getReputation('newUser');
    expect(result.type).toBe('ok');
    expect(result.value).toEqual({ score: 0, totalVerifications: 0, correctVerifications: 0 });
  });
  
  it('should update reputation correctly for correct verifications', () => {
    const user = 'user1';
    updateReputation(user, true);
    updateReputation(user, true);
    
    const result = getReputation(user);
    expect(result.type).toBe('ok');
    expect(result.value).toEqual({ score: 2, totalVerifications: 2, correctVerifications: 2 });
  });
  
  it('should update reputation correctly for incorrect verifications', () => {
    const user = 'user2';
    updateReputation(user, false);
    updateReputation(user, false);
    
    const result = getReputation(user);
    expect(result.type).toBe('ok');
    expect(result.value).toEqual({ score: -2, totalVerifications: 2, correctVerifications: 0 });
  });
  
  it('should handle mixed correct and incorrect verifications', () => {
    const user = 'user3';
    updateReputation(user, true);
    updateReputation(user, false);
    updateReputation(user, true);
    
    const result = getReputation(user);
    expect(result.type).toBe('ok');
    expect(result.value).toEqual({ score: 1, totalVerifications: 3, correctVerifications: 2 });
  });
  
  it('should maintain separate reputations for different users', () => {
    updateReputation('user4', true);
    updateReputation('user5', false);
    
    const result4 = getReputation('user4');
    const result5 = getReputation('user5');
    
    expect(result4.type).toBe('ok');
    expect(result4.value).toEqual({ score: 1, totalVerifications: 1, correctVerifications: 1 });
    
    expect(result5.type).toBe('ok');
    expect(result5.value).toEqual({ score: -1, totalVerifications: 1, correctVerifications: 0 });
  });
});
