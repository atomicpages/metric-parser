import type { Token } from "../token/token";
import { SubType } from "../token/token";
import { TokenHelper } from "../token/token.helper";
import { ParserError } from "../error";
import { TokenError } from "../token/token.error";
import { AbstractSyntaxTreeNode } from "./ast.node";

export abstract class AbstractSyntaxTreeBase extends AbstractSyntaxTreeNode {
  public findRoot(): this | undefined {
    if (this.isRoot()) {
      return this.value !== undefined || !this.leftNode ? this : this.leftNode;
    }

    return this._parent?.findRoot();
  }

  public isRoot(): boolean {
    return !this._parent;
  }

  public isValid(): boolean {
    return (
      (this.value && !this.leftNode && !this.rightNode) ||
      (!!this.leftNode && !!this.rightNode)
    );
  }

  public hasOpenBracket(): boolean {
    if (TokenHelper.isBracketOpen(this.value)) {
      return true;
    }

    const leftNodeHasOpenBracket = this.leftNode
      ? this.leftNode.hasOpenBracket()
      : false;
    const rightNodeHasOpenBracket = this.rightNode
      ? this.rightNode.hasOpenBracket()
      : false;

    return leftNodeHasOpenBracket || rightNodeHasOpenBracket;
  }

  private findOpenedBracket(): this | undefined {
    if (this.isRoot()) {
      return undefined;
    }

    if (TokenHelper.isBracketOpen(this._value)) {
      return this;
    }

    return this._parent.findOpenedBracket();
  }

  public removeRootBracket(): this | undefined {
    const rootNode = this.findRoot();

    if (TokenHelper.isBracketOpen(rootNode.value)) {
      rootNode.leftNode?.removeParent();
    }

    return this === rootNode ? rootNode.leftNode : this;
  }

  public removeClosestBracket(): this {
    const node = this.findOpenedBracket();

    if (!node) {
      throw new ParserError(TokenError.missingOpenBracket);
    }

    const targetNode = node.leftNode;

    if (targetNode) {
      targetNode.subType = SubType.Group;

      if (!node.parent) {
        targetNode.removeParent();
        return targetNode;
      }

      if (node.parent.leftNode === node) {
        node.parent.leftNode = targetNode;
      } else {
        node.parent.rightNode = targetNode;
      }
    }

    return node.parent;
  }

  private climbUp(token: Token): this {
    return this.isClimbTop(token) ? this : this._parent.climbUp(token);
  }

  private isClimbTop(token: Token): boolean {
    return (
      this.isTokenHighest(token) ||
      !this.parent ||
      TokenHelper.isBracketOpen(this.value)
    );
  }

  private isTokenHighest(token: Token): boolean {
    return (
      TokenHelper.getPrecedenceDiff(token, this.value) > 0 &&
      this.subType !== SubType.Group
    );
  }

  private createChildNode(value?: Token): this {
    const node = new (this.constructor as any)(value);
    node.parent = this;
    return node;
  }

  private createParentNode(value?: Token): this {
    const node = new (this.constructor as any)(value);
    this.parent = node;
    return node;
  }

  private insertOperatorNode(value: Token): this {
    const rootNode = this.climbUp(value);

    if (TokenHelper.isBracketOpen(rootNode.value)) {
      return rootNode.insertJointNodeToLeft(value);
    }

    if (this.needJointRight(rootNode, value)) {
      return rootNode.insertJointNodeToRight(value);
    }

    const newNode = rootNode.createParentNode(value);
    newNode.leftNode = rootNode;
    return newNode;
  }

  private needJointRight(rootNode: this, value: Token) {
    return (
      (rootNode.isTokenHighest(value) && rootNode.parent) || this === rootNode
    );
  }

  public insertNode(value: Token): this {
    if (TokenHelper.isSymbol(value)) {
      if (!this.value) {
        this.value = value;
        return this;
      }
    }

    if (TokenHelper.isOperator(value)) {
      return this.insertOperatorNode(value);
    }

    const valueNode = this.createChildNode(value);
    if (!this.leftNode) {
      this.leftNode = valueNode;
    } else {
      this.rightNode = valueNode;
    }

    return valueNode;
  }

  private insertJointNodeToLeft(value: Token): this {
    const jointNode = this.createChildNode(value);

    if (this.leftNode && this.rightNode) {
      jointNode.leftNode = this.leftNode;
      jointNode.rightNode = this.rightNode;
      this.leftNode = jointNode;
    }

    return jointNode;
  }

  public insertJointNodeToRight(value: Token): this {
    const jointNode = this.createChildNode(value);

    if (this.rightNode) {
      jointNode.leftNode = this.rightNode;
    }

    this.rightNode = jointNode;
    return jointNode;
  }

  public removeLeftNode(): void {
    this._leftNode?.removeParent();
    this._leftNode = undefined;
  }

  public removeRightNode(): void {
    this._rightNode?.removeParent();
    this._rightNode = undefined;
  }

  public removeParent(): void {
    this._parent = undefined;
  }
}
