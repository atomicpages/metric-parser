export type Token = string | number;
export type Addition = "+";
export type Subtraction = "-";
export type Multiplication = "*";
export type MultiplicationLiteral = "x";
export type Division = "/";
export type Mod = "%";
export type Pow = "^";
export type BracketOpen = "(";
export type BracketClose = ")";
export type Operator =
  | Addition
  | Subtraction
  | Multiplication
  | MultiplicationLiteral
  | Division
  | Mod
  | Pow;

export type TokenValue = {
  symbols: string[];
  alias: string;
};

export enum Type {
  Unknown,
  Value,
  Dot,
  Operator,
  Bracket,
  Function,
  WhiteSpace,
  CompareToken,
}

export enum SubType {
  Group,
}

// TODO: convert to enum
export const literal = {
  Addition: "+",
  Subtraction: "-",
  Multiplication: "*",
  MultiplicationLiteral: "x",
  Division: "/",
  Mod: "%",
  Pow: "^",
  BracketOpen: "(",
  BracketClose: ")",
  Dot: ".",
};

export const value: Record<string, TokenValue> = {
  Addition: {
    symbols: [literal.Addition],
    alias: literal.Addition,
  },
  Subtraction: {
    symbols: [literal.Subtraction],
    alias: literal.Subtraction,
  },
  Multiplication: {
    symbols: [literal.Multiplication, literal.MultiplicationLiteral],
    alias: literal.Multiplication,
  },
  Division: {
    symbols: [literal.Division],
    alias: literal.Division,
  },
  Mod: {
    symbols: [literal.Mod],
    alias: literal.Mod,
  },
  Pow: {
    symbols: [literal.Pow],
    alias: literal.Pow,
  },
  BracketOpen: {
    symbols: [literal.BracketOpen],
    alias: literal.BracketOpen,
  },
  BracketClose: {
    symbols: [literal.BracketClose],
    alias: literal.BracketOpen,
  },
  Dot: {
    symbols: [literal.Dot],
    alias: literal.Dot,
  },
};

export const addition = [literal.Addition];
export const subtraction = [literal.Subtraction];
export const multiplication = [
  literal.Multiplication,
  literal.MultiplicationLiteral,
];
export const division = [literal.Division];
export const mod = [literal.Mod];
export const pow = [literal.Pow];
export const bracketOpen = literal.BracketOpen;
export const bracketClose = literal.BracketClose;
export const bracket = [bracketOpen, bracketClose];
export const precedence = [
  ...addition,
  ...subtraction,
  ...multiplication,
  ...division,
  ...pow,
  ...mod,
  ...bracket,
];
export const operators = [
  ...addition,
  ...subtraction,
  ...multiplication,
  ...division,
  ...mod,
  ...pow,
];
export const symbols = [...operators, ...bracket];
export const whiteSpace = [" ", "", null, undefined];
