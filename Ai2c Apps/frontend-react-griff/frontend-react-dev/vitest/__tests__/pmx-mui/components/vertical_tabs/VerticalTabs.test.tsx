import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { VerticalTabPanel, verticalTabPanelA11yProps } from '@ai2c/pmx-mui/components/vertical_tabs/VerticalTabPanel';
import { VerticalTabs } from '@ai2c/pmx-mui/components/vertical_tabs/VerticalTabs';

import '@testing-library/jest-dom';

/* Testing Component */
function TestingComponent() {
  const items = ['One', 'Two', 'Three'];
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box data-testid="test-component" component="div">
      <VerticalTabs value={value} handleChange={handleChange}>
        {items.map((item, index) => (
          <Tab
            key={item}
            data-testid={`tab-${index}`}
            label={`Item ${item}`}
            {...verticalTabPanelA11yProps('vertical', index)}
          />
        ))}
      </VerticalTabs>
      {items.map((item, index) => (
        <VerticalTabPanel key={item} data-testid={`tab-panel-${index}`} value={value} index={index}>
          <Box sx={{ p: 3 }}>
            <Typography>{item}</Typography>{' '}
          </Box>
        </VerticalTabPanel>
      ))}
    </Box>
  );
}

/* VerticalTabs Tests */
describe('VerticalTabsTest', () => {
  beforeEach(() => render(<TestingComponent />));

  it('renders Vertical Tabs and associated Vertical Tab Panel', () => {
    expect(screen.getByTestId('tab-0')).toBeInTheDocument();
    const tabPanelOne = screen.getByTestId('tab-panel-0');
    const tabPanelTwo = screen.getByTestId('tab-panel-1');
    const tabPanelThree = screen.getByTestId('tab-panel-2');
    expect(tabPanelOne).toBeVisible();
    expect(tabPanelTwo).not.toBeVisible();
    expect(tabPanelThree).not.toBeVisible();
    expect(tabPanelOne.innerHTML).toContain('One');
  });

  it('changes Tab Panel on Tab click', async () => {
    const tabPanelOne = screen.getByTestId('tab-panel-0');
    const tabPanelTwo = screen.getByTestId('tab-panel-1');
    const tabPanelThree = screen.getByTestId('tab-panel-2');
    expect(tabPanelOne).toBeVisible();
    expect(tabPanelTwo).not.toBeVisible();
    expect(tabPanelThree).not.toBeVisible();

    const tabTwo = screen.getByTestId('tab-1');
    await userEvent.click(tabTwo);
    expect(tabPanelOne).not.toBeVisible();
    expect(tabPanelTwo).toBeVisible();
    expect(tabPanelThree).not.toBeVisible();

    const tabThree = screen.getByTestId('tab-2');
    await userEvent.click(tabThree);
    expect(tabPanelOne).not.toBeVisible();
    expect(tabPanelTwo).not.toBeVisible();
    expect(tabPanelThree).toBeVisible();
  });
});
