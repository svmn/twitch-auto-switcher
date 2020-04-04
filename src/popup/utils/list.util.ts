import {
  NextTargetList,
  NextTargetType,
  CommonOptionValue,
  NextTargetGroupedList,
} from '@/types/next-target.interface';
import { Game } from '@/types/categories.response';

export function buildList(categories: Game[]): NextTargetList {
  return categories.map((x) => ({ type: NextTargetType.Category as const, value: x.name })).slice(0, 8);
}

export function buildInitialList(categories: Game[]): NextTargetList {
  return [
    { type: NextTargetType.Common, value: CommonOptionValue.Current },
    { type: NextTargetType.Common, value: CommonOptionValue.Featured },
    ...categories.map((x) => ({ type: NextTargetType.Category as const, value: x.name })),
  ];
}

export function groupByType(list: NextTargetList): NextTargetGroupedList {
  return list
    .map((x, i) => ({ ...x, id: i }))
    .reduce((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {} as NextTargetGroupedList);
}
