import type {
  ParserGeneralResult,
  ParserResult,
} from "../parser/parser.result";
import type { ParseData } from "../parser/parser";

export type BuilderInterface<T> = {
  build(data: ParseData | T): ParserGeneralResult | ParserResult<T>;
  parse(data: ParseData): ParserResult<T>;
  unparse(data: T): ParserGeneralResult;
};
