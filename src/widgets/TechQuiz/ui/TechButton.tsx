'use client';

import TechImage from './TechImage';

import type { TechName } from '../api/useGetListQuestionWebTech';
import type { Category } from '../api/useGetListQuestionWebTech';
import type { Question } from '../model/types';
import type { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';
import useTechQuestions from '../model/useTechQuestions';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  setQuestions,
  resetQuiz,
  setQuestionsLoading,
} from '../model/quizSlice';

/** Описание технологии для кнопки */
export type ArrTech = {
  techName: TechName;
  category: Category;
  color: string;
};

/** Кнопка выбора технологии */
const Button = styled.button`
  line-height: 0;
  border: none;
  background: transparent;
  user-select: none;
`;

const TechNoImage = styled.span`
  display: flex;
  width: 96px;
  height: 96px;
  background: #eee;
  color: #333;
  text-align: center;
  align-items: center;
  justify-content: center;
  line-height: 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
`;

/**
 * Компонент кнопки технологии
 * @param props.arrTech - Информация о технологии
 * @param props.setCurrentQuestion - Функция установки текущего вопроса
 */
export default function TechButton({
  arrTech,
  setCurrentQuestion,
}: {
  arrTech: ArrTech;
  setCurrentQuestion: Dispatch<SetStateAction<Question | null>>;
}) {
  const questions = useTechQuestions(
    [{ category: arrTech.category, techNames: [arrTech.techName] }],
    30,
  );
  const dispatch = useDispatch();
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTechQuestions = () => {
    setIsLoading(true);
    dispatch(setQuestionsLoading(true));
    dispatch(resetQuiz());
    setCurrentQuestion(null);
    questions.refetch();
  };

  useEffect(() => {
    if (questions.isFetched || questions.isError) {
      if (questions.data) {
        dispatch(setQuestions(questions.data));
      }
      setIsLoading(false);
      dispatch(setQuestionsLoading(false));
    }
  }, [questions.isFetched, questions.isError, questions.data, dispatch]);

  return (
    <Button onClick={handleTechQuestions}>
      {!imgError ? (
        <TechImage
          techName={arrTech.techName}
          color={arrTech.color}
          alt={`Изображение Web-технологии: ${arrTech.techName}`}
          width={96}
          height={96}
          aria-label={`Web-технология: ${arrTech.techName}`}
          onError={() => setImgError(true)}
        />
      ) : (
        <TechNoImage aria-label={`Web-технология: ${arrTech.techName}`}>
          {arrTech.techName}
        </TechNoImage>
      )}
    </Button>
  );
}
