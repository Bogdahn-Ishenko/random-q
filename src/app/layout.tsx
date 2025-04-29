'use client';
import { Providers } from '@/processes/Providers';
import './globals.css';
import styled, { createGlobalStyle } from 'styled-components';
import { Provider } from 'react-redux';
import { store } from './state/store';
import '@/shared/api/firebase/init';
import StyledComponentsRegistry from '@/processes/registry';

const GlobalStyle = createGlobalStyle`
  html, body, * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
  }

  button {
    cursor: default;
    &:not(:disabled):hover {
      cursor: pointer;
    }
    &:disabled {
      cursor: not-allowed;
    }
  }
`;

const WrapperMain = styled.main`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <title>random-q</title>
      <body>
        <StyledComponentsRegistry>
          <Provider store={store}>
            <GlobalStyle />
            <Providers>
              <WrapperMain>{children}</WrapperMain>
            </Providers>
          </Provider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
