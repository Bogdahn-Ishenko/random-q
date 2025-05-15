import database from '@/shared/api/firebase/init';
import { get, ref } from 'firebase/database';

/**
 * Определяет возможные категории вопросов
 * - framework: Вопросы по фреймворкам
 * - language: Вопросы по языкам программирования
 */
export type Category = 'framework' | 'language';

/**
 * Определяет поддерживаемые технологии
 * Включает React, JavaScript и TypeScript
 */
export type TechName = 'React' | 'JavaScript' | 'TypeScript' | 'HRInterview';

/**
 * Описывает структуру выбора категории и технологий
 * @property category - Выбранная категория вопросов
 * @property techNames - Опциональный массив конкретных технологий
 */
type CategorySelection =
  | { category: Category; techNames?: TechName[] }
  | { category: Category; techNames: TechName[] };

/**
 * Определяет функцию получения списка вопросов
 * @param selections - Массив выбранных категорий и технологий
 * @param limit - Максимальное количество возвращаемых вопросов
 * @returns Promise с массивом вопросов
 */
type GetListQuestionWebTech = (
  selections: CategorySelection[],
  limit: number,
) => Promise<any[]>;

/**
 * Рассчитывает вес вопроса на основе его параметров
 * @param priority Приоритет вопроса
 * @param counter Количество показов
 * @param missed Количество пропусков
 */
const calculateWeight = (priority: number, counter: number, missed: number) => {
  return (1 / (priority * Math.pow(1.5, counter))) * (1 + missed);
};

/**
 * Получает список технологий для заданной категории
 * @param category Категория вопросов
 */
const getAllTechNames = async (category: Category): Promise<TechName[]> => {
  const catRef = ref(database, `categories/${category}`);
  const snap = await get(catRef);
  if (!snap.exists()) return [];
  return Object.keys(snap.val()) as TechName[];
};

/**
 * Получает все доступные категории и технологии
 * @returns Объект с категориями и их технологиями
 */
export async function getAllCategoriesAndTechs(): Promise<
  Record<string, TechName[]>
> {
  const catRef = ref(database, `categories`);
  const snap = await get(catRef);
  if (!snap.exists()) return {};
  const data = snap.val();
  const result: Record<string, TechName[]> = {};
  for (const category of Object.keys(data)) {
    result[category] = Object.keys(data[category]).map(
      (name) => name as TechName,
    );
  }
  return result;
}

/**
 * Перемешивает элементы массива в случайном порядке
 * @template T - Тип элементов в массиве
 * @param arr - Исходный массив
 * @returns Новый перемешанный массив
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Сортирует и перемешивает группу вопросов по весу и счетчику
 * @param group - Массив вопросов для сортировки
 * @returns Отсортированный и частично перемешанный массив вопросов
 */
function sortAndShuffleGroup(group: any[]) {
  group.sort((a, b) => {
    if (a.weight !== b.weight) {
      return b.weight - a.weight;
    }
    return a.counter - b.counter;
  });

  let i = 0;
  while (i < group.length) {
    let j = i + 1;
    while (
      j < group.length &&
      group[j].weight === group[i].weight &&
      group[j].counter === group[i].counter
    ) {
      j++;
    }
    if (j - i > 1) {
      const sub = shuffle(group.slice(i, j));
      for (let k = 0; k < sub.length; k++) group[i + k] = sub[k];
    }
    i = j;
  }
  return group;
}

/**
 * Хук для получения отсортированного списка вопросов с учетом приоритета и веса
 * @param selections Массив выбранных категорий и технологий
 * @param limit Максимальное количество вопросов
 */
const useGetListQuestionWebTech: GetListQuestionWebTech = async (
  selections,
  limit,
) => {
  let allQuestions: any[] = [];

  let localCounters: Record<string, number> = {};
  let localMissed: Record<string, number> = {};
  if (typeof window !== 'undefined') {
    try {
      localCounters = JSON.parse(
        localStorage.getItem('questionCounters') || '{}',
      );
    } catch {
      localCounters = {};
    }
    try {
      localMissed = JSON.parse(localStorage.getItem('questionMissed') || '{}');
    } catch {
      localMissed = {};
    }
  }

  for (const sel of selections) {
    let techNames: TechName[] = [];
    if (sel.techNames && sel.techNames.length > 0) {
      techNames = sel.techNames;
    } else {
      techNames = await getAllTechNames(sel.category);
    }
    for (const techName of techNames) {
      const questionsRef = ref(
        database,
        `categories/${sel.category}/${techName}`,
      );
      const snap = await get(questionsRef);
      if (!snap.exists()) continue;
      const questions = Object.entries(snap.val()).map(
        ([id, data]: [string, any]) => {
          const localKey = `${sel.category}:${techName}:${id}`;
          const localCounter = localCounters[localKey];
          const missed =
            typeof localMissed[localKey] === 'number'
              ? localMissed[localKey]
              : 0;
          return {
            id,
            category: sel.category,
            techName,
            ...(data as any),
            counter:
              typeof localCounter === 'number'
                ? localCounter
                : typeof (data as any).counter === 'number'
                ? (data as any).counter
                : 0,
            missed,
            localKey,
          };
        },
      );
      allQuestions.push(...questions);
    }
  }

  allQuestions.forEach((q) => {
    const priority = typeof q.priority === 'number' ? q.priority : 1;
    const counter = typeof q.counter === 'number' ? q.counter : 0;
    const missed = typeof q.missed === 'number' ? q.missed : 0;
    q.priority = priority;
    q.counter = counter;
    q.weight = calculateWeight(priority, counter, missed);
  });

  const priorities = allQuestions.map((q) => q.priority);
  const minPriority = Math.min(...priorities);
  const maxPriority = Math.max(...priorities);

  const range = maxPriority - minPriority + 1;
  const highEnd = minPriority + Math.floor(range / 3) - 1;
  const mediumEnd = minPriority + Math.floor((2 * range) / 3) - 1;

  const highPriority = allQuestions.filter((q) => q.priority <= highEnd);
  const mediumPriority = allQuestions.filter(
    (q) => q.priority > highEnd && q.priority <= mediumEnd,
  );
  const lowPriority = allQuestions.filter((q) => q.priority > mediumEnd);

  let highCount = Math.floor(
    limit * (highPriority.length / allQuestions.length),
  );
  let mediumCount = Math.floor(
    limit * (mediumPriority.length / allQuestions.length),
  );
  let lowCount = limit - highCount - mediumCount;

  highCount = Math.min(highCount, highPriority.length);
  mediumCount = Math.min(mediumCount, mediumPriority.length);
  lowCount = Math.min(
    lowCount,
    lowPriority.length,
    limit - highCount - mediumCount,
  );

  let totalPicked = highCount + mediumCount + lowCount;
  if (totalPicked < limit) {
    let left = limit - totalPicked;
    let addHigh = Math.min(left, highPriority.length - highCount);
    highCount += addHigh;
    left -= addHigh;
    let addMedium = Math.min(left, mediumPriority.length - mediumCount);
    mediumCount += addMedium;
    left -= addMedium;
    let addLow = Math.min(left, lowPriority.length - lowCount);
    lowCount += addLow;
  }

  function pickGroup(
    group: any[],
    totalCount: number,
    repetitionLimit: number,
  ) {
    const repetition = sortAndShuffleGroup(
      group.filter((q) => q.counter > 0),
    ).slice(0, repetitionLimit);
    const usedIds = new Set(repetition.map((q) => q.id));
    const fresh = sortAndShuffleGroup(
      group.filter((q) => q.counter === 0 && !usedIds.has(q.id)),
    ).slice(0, totalCount - repetition.length);
    return [...repetition, ...fresh];
  }

  const totalRepetition = Math.floor(limit * (2 / 6));
  const highRepetition = Math.floor((highCount / limit) * totalRepetition);
  const mediumRepetition = Math.floor((mediumCount / limit) * totalRepetition);
  const lowRepetition = totalRepetition - highRepetition - mediumRepetition;

  let result: any[] = [];
  const highPicked = pickGroup(highPriority, highCount, highRepetition);
  const mediumPicked = pickGroup(mediumPriority, mediumCount, mediumRepetition);
  const lowPicked = pickGroup(lowPriority, lowCount, lowRepetition);

  result.push(...highPicked, ...mediumPicked, ...lowPicked);

  const seen = new Set();
  result = result.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  if (result.length < limit) {
    const usedIds = new Set(result.map((q) => q.id));

    const rest = [...highPriority, ...mediumPriority, ...lowPriority]
      .filter((q) => !usedIds.has(q.id))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        if (a.counter !== b.counter) {
          return a.counter - b.counter;
        }
        return b.weight - a.weight;
      });

    for (const q of rest) {
      if (result.length >= limit) break;
      if (!seen.has(q.id)) {
        result.push(q);
        seen.add(q.id);
      }
    }
  }

  result.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    if (a.counter !== b.counter) {
      return a.counter - b.counter;
    }
    return b.weight - a.weight;
  });

  return result.slice(0, limit);
};

export default useGetListQuestionWebTech;
