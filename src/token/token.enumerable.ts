import type { Token } from "./token";
import { TokenHelper } from "./token.helper";
import type { ParserStack } from "../parser/parser.result";
import { TokenValidator } from "./token.validator";
import { ParserError } from "../error";
import { TokenError } from "./token.error";
import type { Maybe } from "../types";

export class TokenEnumerable {
  private tokenStack: Token[] = [];
  private cursor = 0;
  private currentToken: Token;

  private _stack: Maybe<ParserStack> = undefined;

  private _nextStack: ParserStack = {
    line: 0,
    col: 0,
  };

  protected get stack(): ParserStack {
    return this._stack ?? this._nextStack;
  }

  protected set stack(value: ParserStack) {
    this._stack = this._nextStack;
    this._nextStack = value;
  }

  constructor(protected token: Token[]) {}

  protected rewind(): void {
    this.cursor = 0;
    this.currentToken = undefined;
    this._stack = undefined;

    this._nextStack = {
      col: 0,
      line: 0,
    };

    this.tokenStack = [];
  }

  private calculateStack(token: Token): void {
    if (TokenHelper.isLineEscape(token)) {
      this.stack = {
        line: this._nextStack.line + 1,
        col: 0,
      };

      return;
    }

    this.stack = {
      line: this._nextStack.line,
      col: this._nextStack.col + 1,
    };
  }

  protected finalizeStack(): void {
    this.stack = undefined;
  }

  protected addStack(token: Token): void {
    this.tokenStack.push(token);
  }

  protected popStack(): Token | undefined {
    return this.tokenStack.length
      ? this.tokenStack[this.tokenStack.length - 1]
      : undefined;
  }

  public next() {
    const tokenStack: Token = [];

    if (this.cursor >= this.token.length) {
      return undefined;
    }

    do {
      this.currentToken = this.findToken();

      if (!TokenHelper.isUnknown(this.currentToken)) {
        tokenStack.push(this.currentToken);
      }
    } while (this.proceedNext());

    const token = this.makeToken(tokenStack);
    const error = TokenValidator.validateToken(token);

    if (error) {
      throw error;
    }

    return token;
  }

  private proceedNext(): boolean {
    const token = this.currentToken;
    const nextToken = this.token[this.cursor];

    return this.isSequentialValue(token, nextToken);
  }

  private isSequentialValue(token: Token, nextToken: Token) {
    const tokenType = TokenHelper.induceType(token);
    const nextTokenType = TokenHelper.induceType(nextToken);

    return (
      (tokenType === Type.Value &&
        TokenHelper.isNumeric(token) &&
        tokenType === nextTokenType) ||
      (tokenType === Type.Value &&
        TokenHelper.isNumeric(token) &&
        nextTokenType === Type.Dot) ||
      (tokenType === Type.Dot &&
        TokenHelper.isNumeric(nextToken) &&
        nextTokenType === Type.Value)
    );
  }

  private findToken(): Token | undefined {
    while (this.cursor < this.token.length) {
      const token = this.getToken();
      this.cursor += 1;
      this.calculateStack(token);

      if (!TokenHelper.isWhiteSpace(token)) {
        return token;
      }
    }
  }

  private getToken(): Token {
    const token = this.token[this.cursor];
    return this.getAliasToken(token);
  }

  private getAliasToken(token: Token): Token {
    if (!TokenHelper.isOperator(token)) {
      return token;
    }

    return (
      Object.keys(value)
        .map((operatorType) =>
          value[operatorType].symbols.includes(token)
            ? value[operatorType].alias
            : undefined,
        )
        .find((alias) => alias !== undefined) || token
    );
  }

  private isTokenArrayNumeric(tokens: Token[]): boolean {
    return tokens.every(
      (token) => TokenHelper.isNumeric(token) || TokenHelper.isDot(token),
    );
  }

  private makeToken(tokens: Token[]): Token | undefined {
    if (!tokens.length) {
      return undefined;
    }

    if (this.isTokenArrayNumeric(tokens)) {
      return tokens.join("");
    }

    if (tokens.length > 1) {
      throw new ParserError(
        TokenError.invalidNonNumericValue,
        this.makeTokenString(tokens),
      );
    }

    return tokens[0];
  }

  private makeTokenString(tokens: Token[]): string {
    return tokens
      .map((token) =>
        typeof token === "object" ? JSON.stringify(token) : token,
      )
      .join("");
  }
}
