import { createSlice } from '@reduxjs/toolkit';
import type { Question } from './types';

/** Группировка технологий по их категориям */
type TechNameGroups = Record<string, string[]>;

/** Состояние викторины */
interface QuizState {
  /**
   * Хранилище вопросов викторины, содержащее:
   * - Словарь вопросов по их идентификаторам
   * - Упорядоченный список идентификаторов
   * - Группировку по категориям
   */
  questions: {
    /** Словарь вопросов по их идентификаторам */
    byId: Record<string, Question>;
    /** Упорядоченный список идентификаторов вопросов */
    allIds: string[];
    /** Группировка технологий по категориям */
    categoryGroups: Record<string, TechNameGroups>;
  };
  /** Информация о текущей сессии викторины */
  session: {
    /** Идентификатор текущего активного вопроса */
    currentQuestionId: string;
    /** Флаг завершения текущего набора вопросов */
    isFinished: boolean;
    /** Флаг загрузки компонента */
    isLoaded: boolean;
    /** Флаг загрузки вопросов */
    isQuestionsLoading: boolean;
    /** Флаг отображения хотя бы одного вопроса */
    hasShownQuestions: boolean;
    /** Флаг выбора технологии */
    isTechSelected: boolean;
  };
}

const initialState: QuizState = {
  questions: {
    byId: {},
    allIds: [],
    categoryGroups: {},
  },
  session: {
    currentQuestionId: '',
    isFinished: false,
    isLoaded: false,
    isQuestionsLoading: false,
    hasShownQuestions: false,
    isTechSelected: false,
  },
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    /**
     * Обновляет состояние хранилища вопросов
     *
     * @param state - Текущее состояние
     * @param action - Действие с массивом вопросов
     */
    setQuestions: (state, action) => {
      const questions = Array.isArray(action.payload) ? action.payload : [];

      state.questions.allIds = questions.map((q) => q.id);

      state.questions.byId = {};
      state.questions.categoryGroups = {};

      questions.forEach((q) => {
        state.questions.byId[q.id] = q;

        if (!state.questions.categoryGroups[q.category]) {
          state.questions.categoryGroups[q.category] = {};
        }
        if (!state.questions.categoryGroups[q.category][q.techName]) {
          state.questions.categoryGroups[q.category][q.techName] = [];
        }
        state.questions.categoryGroups[q.category][q.techName].push(q.techName);
      });

      state.session.isTechSelected = true;
    },

    /**
     * Обновляет счётчик просмотров вопроса
     *
     * @param state - Текущее состояние
     * @param action - Действие с идентификатором вопроса и новым значением счётчика
     */
    updateQuestionCounter: (state, action) => {
      const { id, newCounter } = action.payload;
      if (state.questions.byId[id]) {
        state.questions.byId[id].counter = newCounter;
      }
    },

    /**
     * Устанавливает активный вопрос
     *
     * @param state - Текущее состояние
     * @param action - Действие с идентификатором вопроса
     */
    setCurrentQuestionId: (state, action) => {
      state.session.currentQuestionId = action.payload;
      if (action.payload) {
        state.session.hasShownQuestions = true;
      }
    },

    /**
     * Устанавливает флаг завершения вопросов
     * @param state - Текущее состояние
     * @param action - Флаг завершения
     */
    setIsFinished: (state, action) => {
      state.session.isFinished = action.payload;
    },

    /**
     * Устанавливает флаг загрузки компонента
     * @param state - Текущее состояние
     * @param action - Флаг загрузки
     */
    setIsLoaded: (state, action) => {
      state.session.isLoaded = action.payload;
    },

    /**
     * Устанавливает флаг загрузки вопросов
     * @param state - Текущее состояние
     * @param action - Флаг загрузки вопросов
     */
    setQuestionsLoading: (state, action) => {
      state.session.isQuestionsLoading = action.payload;
    },

    /**
     * Сбрасывает состояние викторины
     * @param state - Текущее состояние
     */
    resetQuiz: (state) => {
      state.session.currentQuestionId = '';
      state.session.isFinished = false;
      state.session.hasShownQuestions = false;
      // Don't reset isTechSelected to keep "Получить вопрос" enabled
      // state.session.isTechSelected = false;
    },
  },
});

export const {
  setQuestions,
  setCurrentQuestionId,
  updateQuestionCounter,
  setIsFinished,
  setIsLoaded,
  setQuestionsLoading,
  resetQuiz,
} = quizSlice.actions;
export default quizSlice.reducer;
