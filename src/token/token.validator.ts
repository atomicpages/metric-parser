import type { Token } from "./token";
import { TokenHelper } from "./token.helper";
import { ParserError } from "../error";
import { TokenError } from "./token.error";

export enum TokenValidateLevel {
  Pass,
  Escape,
  Fatal,
}

export class TokenValidator {
  public static validateToken(token: Token): ParserError | undefined {
    const level = TokenValidator.extractTokenLevel(token);

    if (level === TokenValidateLevel.Fatal) {
      return new ParserError(TokenError.invalidToken, token);
    }
  }

  public static validateValueToken(
    token: Token,
    prevToken: Token,
  ): ParserError | undefined {
    if (!prevToken) {
      return undefined;
    }

    if (TokenHelper.isValue(prevToken)) {
      return new ParserError(TokenError.missingOperator, prevToken);
    }

    if (
      !TokenHelper.isBracketOpen(prevToken) &&
      !TokenHelper.isOperator(prevToken)
    ) {
      return new ParserError(TokenError.missingOperator, prevToken);
    }
  }

  private static extractTokenLevel(token: Token) {
    const levelExtractors = [
      { predicate: TokenHelper.isUnknown, level: TokenValidateLevel.Fatal },
      { predicate: TokenHelper.isToken, level: TokenValidateLevel.Pass },
    ];

    const extractedLevel = levelExtractors.find((extractor) =>
      extractor.predicate(token),
    );
    return extractedLevel ? extractedLevel.level : TokenValidateLevel.Fatal;
  }
}
