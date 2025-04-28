'use client';

import styled from 'styled-components';

/** Стилизованная кнопка управления */
const Button = styled.button<{
  $variant?: 'default' | 'primary' | 'highlight';
}>`
  all: unset;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #f9f9f9;
  cursor: default;
  transition: all 0.25s;
  color: var(--foreground);
  user-select: none;

  &:not(:disabled):hover {
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.question-button:not(:disabled):hover {
    border-color: #646cff;
  }

  ${(props) =>
    props.$variant === 'highlight' &&
    `
    border-color: #646cff;
  `}

  ${(props) =>
    props.$variant === 'primary' &&
    `
    background-color: #f0f0f0;
    &:not(:disabled):hover {
      background-color: #e5e5e5;
    }
  `}
`;

export default function QuizControlButton({
  onClick,
  children,
  disabled,
  variant = 'default',
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'highlight';
}) {
  return (
    <Button
      className="question-button"
      onClick={onClick}
      disabled={disabled}
      $variant={variant}
    >
      {children}
    </Button>
  );
}
