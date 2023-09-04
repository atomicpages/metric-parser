import type { Token } from "./token";

const re = /^[+-]?\d*\.?\d+(?:[Ee][+-]?\d+)?$/;

export abstract class TokenTypeHelper {
  public static isNumeric(value: Token): boolean {
    return re.test(String(value));
  }

  public static isArray(token: Token): boolean {
    return Array.isArray(token);
  }

  public static isString(token: Token): boolean {
    return typeof token === "string";
  }

  public static isObject(token: Token): boolean {
    return typeof token === "object";
  }

  public static isValue(token: Token): boolean {
    return TokenTypeHelper.isObject(token) || TokenTypeHelper.isNumeric(token);
  }
}
