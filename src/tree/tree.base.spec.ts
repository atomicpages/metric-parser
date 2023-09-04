import { expect, describe, it } from "vitest";
import { TreeBuilderBase } from "./tree.base";
import { AbstractSyntaxTree } from "../ast/ast";
import { literal } from "../token/token";
import { GeneralError } from "../error.value";

class TreeBuilderTest extends TreeBuilderBase<any> {}

describe("test class: TreeBuilderBase", () => {
  describe("test method: TreeBuilderBase.makeTree()", () => {
    it("should throw a methodNotImplemented error", () => {
      const ast = new AbstractSyntaxTree(literal.Multiplication);
      ast.leftNode = new AbstractSyntaxTree("2");
      ast.rightNode = new AbstractSyntaxTree("3");

      const treeBuilder = new TreeBuilderTest();
      expect(() => treeBuilder.makeTree())
        .toThrow("method not implemented")
        .and.that.property("code")
        .equal(GeneralError.methodNotImplemented.code);
    });
  });

  describe("test method: TreeBuilderBase.makeAst()", () => {
    it("should throw a methodNotImplemented error", () => {
      const tree = {
        value: "+",
        leftNode: 1,
        rightNode: 2,
      };

      const treeBuilder = new TreeBuilderTest();
      expect(() => treeBuilder.makeAst(tree))
        .toThrow("method not implemented")
        .and.that.property("code")
        .equal(GeneralError.methodNotImplemented.code);
    });
  });
});
