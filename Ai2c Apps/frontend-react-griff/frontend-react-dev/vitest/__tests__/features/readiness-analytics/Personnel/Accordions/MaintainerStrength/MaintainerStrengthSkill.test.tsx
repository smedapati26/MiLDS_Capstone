import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import MaintainerStrengthSkill from '@features/readiness-analytics/Personnel/Accordions/MaintainerStrength/MaintainerStrengthSkill';

describe('MaintainerStrengthSkill', () => {
  it('renders the Skill component', () => {
    render(<MaintainerStrengthSkill />);
    expect(screen.getByText('MaintainerStrengthSkill')).toBeInTheDocument();
  });
});
