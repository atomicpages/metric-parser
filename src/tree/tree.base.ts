import type { AbstractSyntaxTree } from "../ast/ast";
import type { TreeBuilderInterface } from "./tree.interface";
import { GeneralError } from "../error.value";
import { ParserError } from "../error";

export abstract class TreeBuilderBase<T> implements TreeBuilderInterface<T> {
  public makeTree(): T {
    throw new ParserError(GeneralError.methodNotImplemented);
  }

  public makeAst(): AbstractSyntaxTree {
    throw new ParserError(GeneralError.methodNotImplemented);
  }
}
