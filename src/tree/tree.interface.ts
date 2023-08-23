import type { AbstractSyntaxTree } from "../ast/ast";

export type TreeBuilderInterface<T> = {
  makeTree(ast: AbstractSyntaxTree): T;
  makeAst(tree: T): AbstractSyntaxTree;
};
