import type { ErrorValue } from "../error.value";

export namespace TokenError {
  export const id = 0x0100;
  export const invalidToken: ErrorValue = {
    code: 0x0100,
    text: "`{0}` token is invalid token type",
  };
  export const invalidTwoOperator: ErrorValue = {
    code: 0x0101,
    text: "two operators `{0}`, `{1}` can not come together",
  };
  export const invalidNonNumericValue: ErrorValue = {
    code: 0x0102,
    text: "non-numeric token `{0}` can not be consecutive",
  };
  export const missingOperator: ErrorValue = {
    code: 0x0112,
    text: "the operator is missing after `{0}`",
  };
  export const missingOpenBracket: ErrorValue = {
    code: 0x0120,
    text: "missing open bracket, you cannot close the bracket",
  };
  export const missingCloseBracket: ErrorValue = {
    code: 0x0121,
    text: "missing close bracket, the bracket must be closed",
  };
  export const missingValueBefore: ErrorValue = {
    code: 0x0122,
    text: "missing value before `{0}` token",
  };
  export const missingValueAfter: ErrorValue = {
    code: 0x0123,
    text: "missing value after `{0}` token",
  };
  export const emptyToken: ErrorValue = {
    code: 0x0150,
    text: "token is empty",
  };
}
