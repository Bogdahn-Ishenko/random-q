'use client';

import styled from 'styled-components';
import TechButton from './TechButton';
import type { ArrTech } from './TechButton';
import { useState, useEffect, useRef } from 'react';
import QuestionField from './QuestionField';
import QuizControlButton from './QuizControlButton';
import QuizTitle from './QuizTitle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/state/store';
import {
  setCurrentQuestionId,
  updateQuestionCounter,
  setIsFinished,
  setIsLoaded,
  resetQuiz,
} from '../model/quizSlice';
import type { Question } from '../model/types';
import { getAllCategoriesAndTechs } from '../api/useGetListQuestionWebTech';
import type { Category, TechName } from '../api/useGetListQuestionWebTech';

const Wrapper = styled.section<{ $isVisible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column nowrap;

  max-width: 1280px;
  height: max-content;

  grid-row: 3;
  justify-self: center;

  padding: 32px;
  row-gap: 2em;

  visibility: ${(props) => (props.$isVisible ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition: visibility 0s ${(props) => (props.$isVisible ? '0s' : '0.3s')},
    opacity 0.3s linear;
`;

const TechList = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 50px;
  justify-content: center;
  padding: 0px 24px;

  grid-column: span 2;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s, opacity 0.3s linear;

  &.loaded {
    visibility: visible;
    opacity: 1;
  }
`;

const QuizControls = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 1em;
`;

/** Предустановленные технологии с их цветовыми обозначениями */
const arrTechsStatic: ArrTech[] = [
  { techName: 'JavaScript', category: 'language', color: '#f7df1e' },
  { techName: 'TypeScript', category: 'language', color: '#1976d2' },
  { techName: 'React', category: 'framework', color: '#087ea4' },
  { techName: 'HRInterview', category: 'softskills', color: '#B2DFDB' },
];

/**
 * Компонент викторины по веб-технологиям
 *
 * Управляет:
 * - Отображением списка технологий
 * - Состоянием текущего вопроса
 * - Навигацией по вопросам
 * - Сохранением прогресса
 */
export default function TechQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [arrTechs, setArrTechs] = useState<ArrTech[]>(arrTechsStatic);
  const [shownQuestions, setShownQuestions] = useState<Set<string>>(new Set());
  const questionsIdsRef = useRef<string[]>([]);
  const [isStylesLoaded, setIsStylesLoaded] = useState(false);

  const currentQuestionId = useSelector(
    (state: RootState) => state.quiz.session.currentQuestionId,
  );
  const isFinished = useSelector(
    (state: RootState) => state.quiz.session.isFinished,
  );
  const isLoaded = useSelector(
    (state: RootState) => state.quiz.session.isLoaded,
  );
  const questions = useSelector(
    (state: RootState) => state.quiz.questions.byId,
  );
  const questionsIds = useSelector(
    (state: RootState) => state.quiz.questions.allIds,
  );
  const isQuestionsLoading = useSelector(
    (state: RootState) => state.quiz.session.isQuestionsLoading,
  );
  const hasShownQuestions = useSelector(
    (state: RootState) => state.quiz.session.hasShownQuestions,
  );
  const isTechSelected = useSelector(
    (state: RootState) => state.quiz.session.isTechSelected,
  );

  const dispatch = useDispatch();

  /**
   * Загружает доступные категории и технологии из базы данных
   * Дополняет статический список технологий
   */
  useEffect(() => {
    getAllCategoriesAndTechs().then((data) => {
      const techs: ArrTech[] = [...arrTechsStatic];
      for (const category of Object.keys(data) as Category[]) {
        for (const techName of data[category] as TechName[]) {
          if (
            !techs.some(
              (t) => t.techName === techName && t.category === category,
            )
          ) {
            const staticTech = arrTechsStatic.find(
              (t) => t.techName === techName && t.category === category,
            );
            techs.push({
              techName: techName as TechName,
              category: category as Category,
              color: staticTech ? staticTech.color : '#cccccc',
            });
          }
        }
      }
      setArrTechs(techs);
    });
  }, []);

  /**
   * Синхронизирует список идентификаторов вопросов с локальной ссылкой
   */
  useEffect(() => {
    questionsIdsRef.current = questionsIds;
  }, [questionsIds]);

  /**
   * Обрабатывает показ вопроса:
   * - Обновляет счётчики в локальном хранилище
   * - Обновляет состояние в Redux
   * - Отмечает вопрос как просмотренный
   */
  useEffect(() => {
    if (
      currentQuestion?.id &&
      currentQuestion.category &&
      currentQuestion.techName
    ) {
      const localKey = `${currentQuestion.category}:${currentQuestion.techName}:${currentQuestion.id}`;
      const counters = JSON.parse(
        localStorage.getItem('questionCounters') || '{}',
      );

      const oldCounter = counters[localKey] || 0;
      const currentStoreCounter = questions[currentQuestion.id]?.counter || 0;

      if (currentStoreCounter === oldCounter) {
        const newCounter = oldCounter + 1;
        counters[localKey] = newCounter;
        localStorage.setItem('questionCounters', JSON.stringify(counters));

        dispatch(
          updateQuestionCounter({
            id: currentQuestion.id,
            newCounter,
          }),
        );
      }

      setShownQuestions((prev) => {
        const next = new Set(prev);
        next.add(currentQuestion.id!);
        return next;
      });
    }
  }, [currentQuestion?.id]);

  /**
   * Сохраняет информацию о пропущенных вопросах при закрытии страницы
   */
  useEffect(() => {
    const handleUnload = () => {
      const missed = JSON.parse(localStorage.getItem('questionMissed') || '{}');
      for (const id of questionsIdsRef.current) {
        if (!shownQuestions.has(id)) {
          const q = questions[id];
          if (!q) continue;
          const key = `${q.category}:${q.techName}:${id}`;
          missed[key] = (missed[key] || 0) + 1;
        }
      }
      localStorage.setItem('questionMissed', JSON.stringify(missed));
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [shownQuestions, questions]);

  /**
   * Переходит к следующему вопросу в списке
   * При достижении конца списка блокирует кнопку
   */
  const handleNextQuestion = () => {
    if (currentQuestionId !== '') {
      let currentIndex = questionsIds.findIndex((q) => q === currentQuestionId);
      if (currentIndex !== -1 && currentIndex + 1 < questionsIds.length) {
        const nextId = questionsIds[currentIndex + 1];
        dispatch(setCurrentQuestionId(nextId));
        dispatch(setIsFinished(currentIndex + 2 >= questionsIds.length));
      }
    } else if (questionsIds.length > 0) {
      dispatch(setCurrentQuestionId(questionsIds[0]));
      dispatch(setIsFinished(questionsIds.length <= 1));
    }
  };

  /**
   * Перезапускает викторину:
   * - Сбрасывает текущий вопрос
   * - Сохраняет пропущенные вопросы
   * - Очищает состояние просмотренных вопросов
   */
  const handleRestartQuiz = () => {
    dispatch(resetQuiz());
    setCurrentQuestion(null);
    const missed = JSON.parse(localStorage.getItem('questionMissed') || '{}');
    for (const id of questionsIds) {
      if (!shownQuestions.has(id)) {
        const q = questions[id];
        if (!q) continue;
        const key = `${q.category}:${q.techName}:${id}`;
        missed[key] = (missed[key] || 0) + 1;
      }
    }
    localStorage.setItem('questionMissed', JSON.stringify(missed));
    setShownQuestions(new Set());
    dispatch(setIsFinished(false));
  };

  /**
   * Синхронизирует локальное состояние вопроса с Redux
   */
  useEffect(() => {
    if (
      currentQuestionId !== undefined &&
      currentQuestionId !== null &&
      currentQuestionId !== '' &&
      questions[currentQuestionId]
    ) {
      setCurrentQuestion(questions[currentQuestionId]);
    }
  }, [currentQuestionId, questions]);

  // Add effect for handling initial load animation
  useEffect(() => {
    dispatch(setIsLoaded(true));
  }, []);

  // Add this at the beginning of component
  useEffect(() => {
    // Даем время на подгрузку стилей
    const timer = setTimeout(() => {
      setIsStylesLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Wrapper $isVisible={isStylesLoaded}>
        <div style={{ display: 'flex', flexFlow: 'column nowrap', gap: '4em' }}>
          <TechList className={isLoaded ? 'loaded' : ''}>
            {arrTechs.map((arrTech) => (
              <TechButton
                arrTech={arrTech}
                setCurrentQuestion={setCurrentQuestion}
                key={`${arrTech.category}:${arrTech.techName}`}
              />
            ))}
          </TechList>
          <QuizTitle />
        </div>
        <QuizControls>
          <QuizControlButton
            onClick={handleNextQuestion}
            disabled={
              !isTechSelected ||
              !questionsIds.length ||
              isQuestionsLoading ||
              (currentQuestionId !== '' &&
                questionsIds.indexOf(currentQuestionId) ===
                  questionsIds.length - 1)
            }
            variant="primary"
          >
            Получить вопрос
          </QuizControlButton>
          <QuizControlButton
            onClick={handleRestartQuiz}
            disabled={!hasShownQuestions || isQuestionsLoading}
            variant={isFinished ? 'highlight' : 'default'}
          >
            Начать сначала
          </QuizControlButton>
        </QuizControls>
        <QuestionField>{currentQuestion?.question}</QuestionField>
      </Wrapper>
    </>
  );
}
