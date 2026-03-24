import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

type useNavigationBlockerOptions = {
  shouldBlock: boolean;
  onTrigger: () => void;
};

// Used to block in-app navigation when shouldBlock condition is true and execute onTrigger action when blocked
export const useNavigationBlocker = ({ shouldBlock, onTrigger }: useNavigationBlockerOptions) => {
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      onTrigger();
    }
  }, [blocker, onTrigger]);

  return blocker;
};
