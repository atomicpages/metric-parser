/* eslint-disable @typescript-eslint/unbound-method */
import {
  addition,
  bracket,
  bracketClose,
  bracketOpen,
  division,
  literal,
  mod,
  multiplication,
  operators,
  pow,
  subtraction,
  symbols,
  whiteSpace,
  type Token,
} from "./token";
import { TokenTypeHelper } from "./token.type.helper";

export abstract class TokenHelperBase extends TokenTypeHelper {
  private static readonly validators = [
    TokenHelperBase.isNumeric,
    TokenHelperBase.isSymbol,
    TokenHelperBase.isObject,
  ];

  public static isToken(token: Token): boolean {
    return Boolean(
      token && TokenHelperBase.validators.some((validator) => validator(token)),
    );
  }

  public static isUnknown(token: Token): boolean {
    return token === undefined || token === null;
  }

  public static isLineEscape(token: Token): boolean {
    return token === "\n";
  }

  public static isWhiteSpace(token: Token): boolean {
    return whiteSpace.includes(String(token));
  }

  public static isDot(token: Token): boolean {
    return token === literal.Dot;
  }

  public static isAddition(token: Token): boolean {
    return addition.includes(token);
  }

  public static isSubtraction(token: Token): boolean {
    return subtraction.includes(token);
  }

  public static isMultiplication(token: Token): boolean {
    return multiplication.includes(token);
  }

  public static isDivision(token: Token): boolean {
    return division.includes(token);
  }

  public static isMod(token: Token): boolean {
    return mod.includes(token);
  }

  public static isPow(token: Token): boolean {
    return pow.includes(token);
  }

  public static isBracket(token: Token): boolean {
    return bracket.includes(token);
  }

  public static isBracketOpen(token: Token): boolean {
    return token === bracketOpen;
  }

  public static isBracketClose(token: Token): boolean {
    return token === bracketClose;
  }

  public static isSymbol(token: Token): boolean {
    return symbols.includes(String(token));
  }

  public static isOperator(token: Token): boolean {
    return operators.includes(String(token));
  }
}
