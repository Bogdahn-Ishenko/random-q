import styled from 'styled-components';

export default function QuizTitle() {
  const Title = styled.h1`
    font-size: 3.2em;
    line-height: 1.1;
    font-weight: bold;
    text-align: center;
    padding-bottom: 0.5em;
  `;
  return <Title>Случайный вопрос</Title>;
}
