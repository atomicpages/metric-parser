import type { ErrorValue } from "../error.value";

export namespace BuilderError {
  export const id = 0x0300;
  export const emptyData: ErrorValue = { code: 0x0300, text: "data is empty" };
}
