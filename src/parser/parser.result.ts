export type ParserResult<T> = {
  code: number;
  message?: string;
  data?: T;
  stack?: ParserStack;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParserGeneralResult<T = any> = ParserResult<T>;

export type ParserStack = {
  line: number;
  col: number;
};
