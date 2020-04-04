export enum NextTargetType {
  Category = 'category',
  Channel = 'channel',
  Common = 'common',
}

export enum CommonOptionValue {
  Current = 'current',
  Featured = 'featured',
}

export interface NextCategory {
  type: NextTargetType.Category;
  value: string;
}

export interface NextChannel {
  type: NextTargetType.Channel;
  value: string;
}

export interface NextCommonOption {
  type: NextTargetType.Common;
  value: CommonOptionValue;
}

export type NextTarget = NextCategory | NextChannel | NextCommonOption;

export type NextTargetList = NextTarget[];

export type NextTargetGroupedList = {
  [x in NextTargetType]: (NextTarget & { id: number })[];
};
