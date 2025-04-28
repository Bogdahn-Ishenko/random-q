'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';

/** Поле отображения текста вопроса */
const FieldWrapper = styled.div`
  height: min-content;
  min-height: 64px;
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1em;
  border: 2px solid #f2f2f2;
  border-radius: 10px;
  background-color: #fcfcfc;
  padding: 5px 20px;
`;

const Text = styled.p`
  font-size: 1.5em;
  font-weight: 600;
`;

const Help = styled.span`
  color: #888888;
  align-self: center;
  padding-left: 10px;
`;

/**
 * Компонент отображения вопроса
 * @param props.children - Текст вопроса
 */
export default function QuestionField({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <FieldWrapper>
        <Text>{children}</Text>
      </FieldWrapper>
      <Help>Временный текст</Help>
    </span>
  );
}
