import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import type { Meta, StoryObj } from '@storybook/react';

import { ErrorBoundary } from '../../components/layout/ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/Layout/ErrorBoundary',
  component: ErrorBoundary,
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Primary: Story = {
  decorators: [
    (Story) => {
      const router = createBrowserRouter([
        {
          path: '*',
          element: <Story />,
          errorElement: <Story />,
          label: 'error-boundary',
          loader: () => {
            throw {
              status: 404,
              statusText: 'Not Found',
              data: {
                message: 'The requested resource could not be found.',
              },
            };
          },
        },
      ]);

      return <RouterProvider router={router} />;
    },
  ],
};

export const ServerError: Story = {
  decorators: [
    (Story) => {
      const router = createBrowserRouter([
        {
          path: '*',
          element: <Story />,
          errorElement: <Story />,
          label: 'error-boundary',
          loader: () => {
            throw {
              status: 500,
              statusText: 'Internal Server Error',
              data: {
                message: 'Something went wrong on our end.',
              },
            };
          },
        },
      ]);

      return <RouterProvider router={router} />;
    },
  ],
};
