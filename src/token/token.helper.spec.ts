import { expect, describe, it } from "vitest";
import { literal } from "./token";
import { TokenHelper } from "./token.helper";

describe("test method: TokenHelper.getPrecedence()", () => {
  it("should return 0 with addition", () => {
    expect(TokenHelper.getPrecedence(literal.Addition)).toEqual(0);
  });

  it("should return 0 with subtraction", () => {
    expect(TokenHelper.getPrecedence(literal.Subtraction)).toEqual(0);
  });

  it("should return 1 with multiplication", () => {
    expect(TokenHelper.getPrecedence(literal.Multiplication)).toEqual(1);
  });
  it("should return 1 with division", () => {
    expect(TokenHelper.getPrecedence(literal.Division)).toEqual(1);
  });

  it("should return 2 with mod", () => {
    expect(TokenHelper.getPrecedence(literal.Mod)).toEqual(2);
  });

  it("should return 2 with pow", () => {
    expect(TokenHelper.getPrecedence(literal.Pow)).toEqual(2);
  });

  it("should return 3 with bracket open", () => {
    expect(TokenHelper.getPrecedence(literal.BracketOpen)).toEqual(3);
  });

  it("should return 3 with bracket close", () => {
    expect(TokenHelper.getPrecedence(literal.BracketClose)).toEqual(3);
  });
});
