import { Props, ThemedTestingComponent } from '@helpers/ThemedTestingComponent';
import { MainLayout } from '@pmx-mui-components/layout';
import { baseDarkPalette, baseLightPalette, PmxPalette } from '@pmx-mui-theme/index';
import { render, screen } from '@testing-library/react';

describe('ThemedTestingComponent', () => {
  const palette: PmxPalette = {
    light: { ...baseLightPalette },
    dark: { ...baseDarkPalette },
  };

  const renderComponent = (props: Partial<Props> = {}) => {
    const defaultProps: Props = {
      palette,
      mode: 'light',
      children: <MainLayout>Test Child</MainLayout>,
    };

    return render(<ThemedTestingComponent {...defaultProps} {...props} />);
  };

  it('should render children correctly', () => {
    const { getByText } = renderComponent();
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should apply the correct theme', () => {
    renderComponent();
    const background = screen.getByTestId('main-layout');
    expect(background).toHaveStyle(`background-color: rgb(255, 255, 255)`);
  });

  it('should switch to dark mode', () => {
    renderComponent({ mode: 'dark' });
    const background = screen.getByTestId('main-layout');
    expect(background).toHaveStyle(`background-color: rgb(18, 18, 18)`);
  });
});
