import { useContext } from 'react';
import { describe, expect, it } from 'vitest';

import { render } from '@testing-library/react';

import { CrewStrengthContext } from '@features/readiness-analytics/Personnel/Accordions/CrewStrength/CrewStrengthContext';

interface ParamsContext {
  mosRank: string[] | undefined;
  skillRank: string[] | undefined;
  setMosRank: (value: string[] | undefined) => void;
  setSkillRank: (value: string[] | undefined) => void;
}

describe('CrewStrengthContext', () => {
  it('should provide the correct default value when no provider is present', () => {
    let contextValue: ParamsContext | undefined;

    const TestComponent = () => {
      contextValue = useContext(CrewStrengthContext);
      return null;
    };

    render(<TestComponent />);

    expect(contextValue).toBeDefined();
    expect(contextValue!.mosRank).toBeUndefined();
    expect(contextValue!.skillRank).toBeUndefined();
    expect(typeof contextValue!.setMosRank).toBe('function');
    expect(typeof contextValue!.setSkillRank).toBe('function');
  });

  it('should be defined', () => {
    expect(CrewStrengthContext).toBeDefined();
  });
});
