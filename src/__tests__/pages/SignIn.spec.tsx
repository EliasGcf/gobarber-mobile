import React from 'react';
import { render } from 'react-native-testing-library';
import { ThemeProvider } from 'styled-components';

import SignIn from '../../pages/SignIn';

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

const mockTheme = {
  title: 'default',

  colors: {
    background: '#312e38',
    white: '#f4ede8',
    orange: '#FF9000',
    grayHard: '#666360',
    gray: '#999591',
    inputs: '#232129',
    shape: '#3E3B47',
    blackMedium: '#28262E',

    error: '#c53030',
  },

  fonts: {
    regular: 'RobotoSlab-Regular',
    medium: 'RobotoSlab-Medium',
  },
};

const wrapperThemeProvider: React.FC = ({ children }) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

describe('SignIn page', () => {
  it('should contains email/password field', () => {
    const { getByPlaceholder } = render(<SignIn />, {
      wrapper: wrapperThemeProvider,
    });

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
  });
});
