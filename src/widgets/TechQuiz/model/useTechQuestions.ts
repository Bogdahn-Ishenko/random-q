import { useQuery } from '@tanstack/react-query';
import useGetListQuestionWebTech, {
  TechName,
  Category,
} from '../api/useGetListQuestionWebTech';

// Тип для множественного выбора категорий/подкатегорий
/** Описание выбора категорий и подкатегорий */
type CategorySelection =
  | { category: Category; techNames?: TechName[] }
  | { category: Category; techNames: TechName[] };

/**
 * Хук для получения вопросов по выбранным категориям
 * @param selections - Массив выбранных категорий и технологий
 * @param limit - Максимальное количество вопросов
 * @returns Query-объект с вопросами
 */
export default function useTechQuestions(
  selections: CategorySelection[],
  limit: number,
) {
  return useQuery({
    queryKey: ['questions', limit],
    queryFn: () => useGetListQuestionWebTech(selections, limit),
    enabled: false,
    staleTime: Infinity,
  });
}
