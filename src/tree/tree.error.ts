import type { ErrorValue } from "../error.value";

export namespace TreeError {
  export const id = 0x0200;
  export const emptyAst: ErrorValue = { code: 0x0200, text: "AST is empty" };
  export const emptyTree: ErrorValue = { code: 0x0201, text: "tree is empty" };
  export const invalidParserTree: ErrorValue = {
    code: 0x0220,
    text: "invalid parser tree",
  };
}
