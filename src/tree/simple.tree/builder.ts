import { AbstractSyntaxTree } from "../../ast/ast";
import { TokenHelper } from "../../token/token.helper";
import { Token } from "../../token/token";
import { TreeError } from "../tree.error";
import { ParserError } from "../../error";
import { TreeBuilderBase } from "../tree.base";
import type { Node, Operand, Tree, Value, ValueObject } from "./type";

export class TreeBuilder extends TreeBuilderBase<Tree> {
  public makeTree(ast: AbstractSyntaxTree): Tree {
    if (!ast) {
      throw new ParserError(TreeError.emptyAst);
    }

    const tree = this.makeNode(ast);
    if (!TreeBuilder.isValid(tree)) {
      throw new ParserError(TreeError.invalidParserTree);
    }

    return tree as Tree;
  }

  public makeAst(tree?: Tree): AbstractSyntaxTree {
    if (!tree) {
      throw new ParserError(TreeError.emptyTree);
    }

    const ast = this.makeAstNode(tree);
    if (!ast.isValid()) {
      throw new ParserError(TreeError.invalidParserTree);
    }

    return ast;
  }

  private makeNode(node: AbstractSyntaxTree): Node | undefined {
    if (!node) {
      return undefined;
    }

    return node.type === Token.Type.Operator
      ? this.makeOperatorNode(node)
      : this.makeValueNode(node);
  }

  private makeOperatorNode(sourceNode: AbstractSyntaxTree): Tree {
    return {
      operator: sourceNode.value,
      operand1: this.makeNode(sourceNode.leftNode),
      operand2: this.makeNode(sourceNode.rightNode),
    };
  }

  private makeValueNode(sourceNode: AbstractSyntaxTree): Operand {
    return {
      value: this.makeOperandValue(sourceNode),
    };
  }

  private makeOperandValue(sourceNode: AbstractSyntaxTree): ValueObject {
    const type = TokenHelper.isObject(sourceNode.value) ? "item" : "unit";
    return {
      type,
      [type]: sourceNode.value,
    };
  }

  private makeAstNode(node: Node): AbstractSyntaxTree {
    if (!node) {
      return undefined;
    }

    if (TreeBuilder.isTree(node)) {
      const tree = node as Tree;
      const ast = new AbstractSyntaxTree(tree.operator);
      ast.leftNode = this.makeAstNode(tree.operand1);
      ast.rightNode = this.makeAstNode(tree.operand2);
      return ast;
    }

    const operand = node as Operand;
    return new AbstractSyntaxTree(TreeBuilder.getValue(operand));
  }

  private static isTree(node: Node): boolean {
    return !!(node as Tree).operator;
  }

  private static getValue(operand: Operand): Value {
    if (!TreeBuilder.isValidOperand(operand)) {
      throw new ParserError(TreeError.invalidParserTree);
    }

    return operand.value.type === "item"
      ? operand.value.item
      : operand.value.unit;
  }

  private static isValid(node: Node): boolean {
    const tree = node as Tree;
    const operand = node as Operand;

    return (
      !!(tree.operator && tree.operand1 && tree.operand2) ||
      operand.value !== undefined
    );
  }

  private static isValidOperand(operand: Operand): boolean {
    return (
      operand &&
      operand.value &&
      operand.value.type &&
      (operand.value as any)[operand.value.type] !== undefined
    );
  }
}
