import { expect, describe, it } from "vitest";
import { AbstractSyntaxTree } from "../../ast/ast";
import { Type, literal } from "../../token/token";
import type { Operand, Tree } from "./type";
import { TreeBuilder } from "./builder";
import { TreeError } from "../tree.error";

describe("test method: SimpleTree.makeTree()", () => {
  it("should return parser tree", () => {
    const ast = new AbstractSyntaxTree(literal.Multiplication);
    ast.leftNode = new AbstractSyntaxTree("2");
    ast.rightNode = new AbstractSyntaxTree("3");
    const treeBuilder = new TreeBuilder();
    const tree = treeBuilder.makeTree(ast);
    const leftOperand = tree.operand1 as Operand;
    const rightOperand = tree.operand2 as Operand;

    expect(tree.operator).toBe("*");
    expect(leftOperand).to.be.an("object");
    expect(rightOperand).to.be.an("object");
    expect(leftOperand.value.type).toBe("unit");
    expect(leftOperand.value.unit).toBe(2);
    expect(rightOperand.value.type).toBe("unit");
    expect(rightOperand.value.unit).toBe(3);
  });

  it("should return advanced parser tree", () => {
    const customInput = {
      value: 1.56,
      type: "decimal",
      aggregate: "avg",
    };
    const customInput2 = {
      value: "a",
      type: "string",
      aggregate: "none",
    };

    const subNode = new AbstractSyntaxTree(literal.Division);
    subNode.leftNode = new AbstractSyntaxTree("3");
    subNode.rightNode = new AbstractSyntaxTree(customInput2);

    const ast = new AbstractSyntaxTree(literal.Addition);
    ast.leftNode = new AbstractSyntaxTree(customInput);
    ast.rightNode = subNode;

    const treeBuilder = new TreeBuilder();
    const tree = treeBuilder.makeTree(ast);

    const leftOperand = tree.operand1 as Operand;
    const rightOperand = tree.operand2 as Tree;

    const leftOperandOfRightNode = rightOperand.operand1 as Operand;
    const rightOperandOfRightNode = rightOperand.operand2 as Operand;

    expect(tree.operator).toEqual(literal.Addition);
    expect(leftOperand).to.be.an("object");
    expect(rightOperand).to.be.an("object");
    expect(leftOperand.value.type).toEqual("item");
    expect(leftOperand.value.item).toEqual(customInput);
    expect(rightOperand.operator).toEqual(literal.Division);
    expect(leftOperandOfRightNode).to.be.an("object");
    expect(rightOperandOfRightNode).to.be.an("object");
    expect(leftOperandOfRightNode.value.type).toBe("unit");
    expect(leftOperandOfRightNode.value.unit).toBe(3);
    expect(rightOperandOfRightNode.value.type).toBe("item");
    expect(rightOperandOfRightNode.value.item).toEqual(customInput2);
  });

  it("should throw an emptyAst error with empty ast", () => {
    const treeBuilder = new TreeBuilder();

    expect(() => treeBuilder.makeTree(undefined))
      .to.throw("AST is empty")
      .and.that.have.property("code", TreeError.emptyAst.code);
  });

  it("should throw an invalidParserTree error with invalid ast", () => {
    const ast = new AbstractSyntaxTree(literal.Addition);
    const treeBuilder = new TreeBuilder();
    ast.leftNode = new AbstractSyntaxTree(1);

    expect(() => treeBuilder.makeTree(ast))
      .to.throw("invalid parser tree")
      .and.that.have.property("code", TreeError.invalidParserTree.code);
  });
});

describe("test method: SimpleTree.makeAst()", () => {
  it("should return ast", () => {
    const data: Tree = {
      operator: "*",
      operand1: {
        operator: "-",
        operand1: { value: { type: "unit", unit: 2 } },
        operand2: { value: { type: "unit", unit: 1 } },
      },
      operand2: { value: { type: "unit", unit: 3 } },
    };
    const treeBuilder = new TreeBuilder();
    const ast = treeBuilder.makeAst(data);

    expect(ast.type).toEqual(Type.Operator);
    expect(ast.value).toEqual(literal.Multiplication);
    expect(ast.leftNode.type).toEqual(Type.Operator);
    expect(ast.leftNode.value).toEqual(literal.Subtraction);
    expect(ast.leftNode.leftNode.type).toEqual(Type.Value);
    expect(ast.leftNode.leftNode.value).toEqual(2);
    expect(ast.leftNode.rightNode.type).toEqual(Type.Value);
    expect(ast.leftNode.rightNode.value).toEqual(1);
    expect(ast.rightNode.type).toEqual(Type.Value);
    expect(ast.rightNode.value).toEqual(3);
  });

  it("should throw an emptyTree error with empty tree", () => {
    const treeBuilder = new TreeBuilder();

    expect(() => treeBuilder.makeAst(undefined))
      .to.throw("tree is empty")
      .and.that.have.property("code", TreeError.emptyTree.code);
  });
});
