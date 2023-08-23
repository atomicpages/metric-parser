import { Token } from "./token";
import { TokenHelperBase } from "./token.helper.base";

export class TokenHelper extends TokenHelperBase {
  public static induceType(token: Token.Token): Token.Type {
    const typeInducers = [
      { predicate: TokenHelper.isUnkown, type: Token.Type.Unknown },
      { predicate: TokenHelper.isWhiteSpace, type: Token.Type.WhiteSpace },
      { predicate: TokenHelper.isOperator, type: Token.Type.Operator },
      { predicate: TokenHelper.isBracket, type: Token.Type.Bracket },
      { predicate: TokenHelper.isDot, type: Token.Type.Dot },
      { predicate: TokenHelper.isValue, type: Token.Type.Value },
    ];

    const extractedToken = typeInducers.find((inducer) =>
      inducer.predicate(token),
    );
    return extractedToken ? extractedToken.type : Token.Type.Unknown;
  }

  public static getPrecedence(token: Token.Token): number {
    return [
      [TokenHelper.isAddition, TokenHelper.isSubtraction],
      [TokenHelper.isMultiplication, TokenHelper.isDivision],
      [TokenHelper.isMod, TokenHelper.isPow],
      [TokenHelper.isBracket],
    ].findIndex((predicate) => predicate.some((func) => func(token)));
  }

  public static getPrecedenceDiff(
    source: Token.Token,
    target: Token.Token,
  ): number {
    return (
      TokenHelper.getPrecedence(source) - TokenHelper.getPrecedence(target)
    );
  }
}
