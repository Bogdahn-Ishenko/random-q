import type { Category, TechName } from '../api/useGetListQuestionWebTech';

/** Интерфейс вопроса */
export interface Question {
  /** Уникальный идентификатор вопроса */
  id: string;
  /** Категория вопроса */
  category: Category;
  /** Технология, к которой относится вопрос */
  techName: TechName;
  /** Текст вопроса */
  question: string;
  /** Подсказка к вопросу */
  hint: string;
  /** Ответ на вопрос */
  answer: string;
  /** Приоритет вопроса (чем меньше, тем важнее) */
  priority: number;
  /** Количество показов вопроса */
  counter: number;
  /** Вес вопроса для сортировки */
  weight: number;
}
