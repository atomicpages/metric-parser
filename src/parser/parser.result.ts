export type ParserResult<T> = {
  code: number;
  message?: string;
  data?: T;
  stack?: ParserStack;
};

export type ParserGeneralResult = ParserResult<any>;

export type ParserStack = {
  line: number;
  col: number;
};
