/* eslint-disable @typescript-eslint/unbound-method */
import type { Token } from "./token";
import { Type } from "./token";
import { TokenHelperBase } from "./token.helper.base";

export class TokenHelper extends TokenHelperBase {
  public static induceType(token: Token): Type {
    const typeInducers = [
      { predicate: TokenHelper.isUnknown, type: Type.Unknown },
      { predicate: TokenHelper.isWhiteSpace, type: Type.WhiteSpace },
      { predicate: TokenHelper.isOperator, type: Type.Operator },
      { predicate: TokenHelper.isBracket, type: Type.Bracket },
      { predicate: TokenHelper.isDot, type: Type.Dot },
      { predicate: TokenHelper.isValue, type: Type.Value },
    ];

    const extractedToken = typeInducers.find((inducer) =>
      inducer.predicate(token),
    );

    return extractedToken ? extractedToken.type : Type.Unknown;
  }

  public static getPrecedence(token: Token): number {
    return [
      [TokenHelper.isAddition, TokenHelper.isSubtraction],
      [TokenHelper.isMultiplication, TokenHelper.isDivision],
      [TokenHelper.isMod, TokenHelper.isPow],
      [TokenHelper.isBracket],
    ].findIndex((predicate) => predicate.some((func) => func(token)));
  }

  public static getPrecedenceDiff(source: Token, target: Token): number {
    return (
      TokenHelper.getPrecedence(source) - TokenHelper.getPrecedence(target)
    );
  }
}
