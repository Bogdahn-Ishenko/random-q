'use client';

import TechQuiz from '@/widgets/TechQuiz';
import styled from 'styled-components';

const MainSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(6, minmax(auto, 1fr));
  height: 100%;
`;

export default function Home() {
  return (
    <MainSection>
      <TechQuiz />
    </MainSection>
  );
}
