import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PmxButtonGroupSelector from '@components/PmxButtonGroupSelector';

const SAMPLE_VALUES: string[] = ["Option1", "Option2", "Option3"]

const SAMPLE_VALUES_OBJ = [{id: 1, value:"Option1"}, {id: 2, value:"Option2"}, {id: 3, value:"Option3"}]

type WrapperProps = {
  options: string[] | {id: number; value: string}[];
  exclusive?: boolean;
};

const Wrapper: React.FC<WrapperProps> = ({options, exclusive=false}: WrapperProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  return(
    <PmxButtonGroupSelector 
      options={options} 
      label="Test label" 
      selected={selected}
      setSelected={setSelected}
      exclusive={exclusive}
    />
  );
}

// function to check values selected
const getSelectedValues = (container: HTMLElement) => {
  return (
    Array.from(container.querySelectorAll('button[aria-pressed="true"]')).map((btn: Element) => {
      return btn.getAttribute('value');
    })
  );
};


describe("PmxButtonGroupSelector", () => {
  it('renders correctly with the right number of buttons for a list of string', () => {
    render(<PmxButtonGroupSelector 
      options={SAMPLE_VALUES} 
      label="Test label" 
      selected={[]}
      setSelected={() => {}}
    />);
    const labelElement = screen.getByLabelText('Test label');
    const buttons = screen.getAllByRole('button', {});
    expect(labelElement).toBeInTheDocument();
    expect(buttons.length).toEqual(3);
  });

  it('renders correctly with the right number of buttons for a list of objects with id and value', () => {
    render(<PmxButtonGroupSelector 
      options={SAMPLE_VALUES_OBJ} 
      label="Test label" 
      selected={[]}
      setSelected={() => {}}
    />);
    const labelElement = screen.getByLabelText('Test label');
    const buttons = screen.getAllByRole('button', {});
    expect(labelElement).toBeInTheDocument();
    expect(buttons.length).toEqual(3);
  });
  
  it('test selecting and deselecting data from a list of strings', async () => {
    
    // const user = userEvent.setup();
    const { container } = render(<Wrapper options={SAMPLE_VALUES} />);

    expect(getSelectedValues(container)).toEqual([]);

    const button1 = screen.getByRole('button', {name: /Option1/i});
    const button2 = screen.getByRole('button', {name: /Option2/i});
    const button3 = screen.getByRole('button', {name: /Option3/i});
    
    // click 1
    fireEvent.click(button1);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["Option1"]);
    });

    // click 2
    fireEvent.click(button3);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["Option1", "Option3"]);
    });
    
    // click all
    fireEvent.click(button2);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["Option1", "Option2", "Option3"]);
    });

    // remove 1
    fireEvent.click(button1);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'false');
      expect(getSelectedValues(container)).toEqual(["Option2", "Option3"]);
    });

  });

  it('test selecting and deselecting data from a list of object with items id and value', async () => {
    
    // const user = userEvent.setup();
    const { container } = render(<Wrapper options={SAMPLE_VALUES_OBJ} />);

    
    expect(getSelectedValues(container)).toEqual([]);

    const button1 = screen.getByRole('button', {name: /Option1/i});
    const button2 = screen.getByRole('button', {name: /Option2/i});
    const button3 = screen.getByRole('button', {name: /Option3/i});
    
    // click 1
    fireEvent.click(button1);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["1"]);
    });

    // click 2
    fireEvent.click(button3);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["1", "3"]);
    });
    
    // click all
    fireEvent.click(button2);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["1", "2", "3"]);
    });

    // remove 1
    fireEvent.click(button1);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'false');
      expect(getSelectedValues(container)).toEqual(["2", "3"]);
    });

  });

  it('test exclusive selecting and deselecting data from a list of strings', async () => {
    
    // const user = userEvent.setup();
    const { container } = render(<Wrapper options={SAMPLE_VALUES} exclusive />);

    expect(getSelectedValues(container)).toEqual([]);

    const button1 = screen.getByRole('button', {name: /Option1/i});
    const button2 = screen.getByRole('button', {name: /Option2/i});
    const button3 = screen.getByRole('button', {name: /Option3/i});
    
    // click on 1
    fireEvent.click(button1);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["Option1"]);
    });

    // click on 3
    fireEvent.click(button3);
    await waitFor( () => {
      expect(button3).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["Option3"]);
    });
    
    // click on 2
    fireEvent.click(button2);
    await waitFor( () => {
      expect(button2).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["Option2"]);
    });

  });

  it('test exclusive selecting and deselecting data from a list of object with items id and value', async () => {
    
    // const user = userEvent.setup();
    const { container } = render(<Wrapper options={SAMPLE_VALUES_OBJ} exclusive/>);

    
    expect(getSelectedValues(container)).toEqual([]);

    const button1 = screen.getByRole('button', {name: /Option1/i});
    const button2 = screen.getByRole('button', {name: /Option2/i});
    const button3 = screen.getByRole('button', {name: /Option3/i});
    
    // click on 1
    fireEvent.click(button1);
    await waitFor( () => {
      expect(button1).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["1"]);
    });

    // click on 3
    fireEvent.click(button3);
    await waitFor( () => {
      expect(button3).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["3"]);
    });
    
    // click on 2
    fireEvent.click(button2);
    await waitFor( () => {
      expect(button2).toHaveAttribute('aria-pressed', 'true');
      expect(getSelectedValues(container)).toEqual(["2"]);
    });
  });
});
