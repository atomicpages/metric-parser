import type { ErrorValue } from "./error.value";
import { StringHelper } from "./string.helper";
import type { ParserStack } from "./parser/parser.result";

export const success = 0;

export class ParserError extends Error implements ErrorValue {
  public parserStack: ParserStack;
  public code: number;
  public text: string;
  public static readonly defaultParserStack: ParserStack = { line: 0, col: 0 };

  constructor(
    public error: ErrorValue,
    ...args: string[]
  ) {
    super();

    Object.setPrototypeOf(this, ParserError.prototype);

    if (args.length) {
      this.error = {
        ...this.error,
        text: StringHelper.format(this.error.text, ...args),
      };
    }

    this.code = this.error.code;
    this.text = this.error.text;
    this.message = this.text;
  }

  public withStack(stack: ParserStack): ParserError {
    this.parserStack = stack;
    return this;
  }
}
