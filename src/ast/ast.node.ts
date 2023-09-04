import type { SubType, Token, Type } from "../token/token";
import { TokenHelper } from "../token/token.helper";

export abstract class AbstractSyntaxTreeNode {
  protected _value: Token;
  protected _leftNode: this | undefined;
  protected _rightNode: this | undefined;
  protected _parent: this | undefined;
  protected _type: Type;
  protected _subType: SubType;

  get value(): Token {
    return this._value;
  }

  set value(value: Token) {
    this._value = TokenHelper.isNumeric(value) ? Number(value) : value;
    this._type = TokenHelper.induceType(this.value);
  }

  get type(): Type {
    return this._type;
  }

  get subType(): SubType {
    return this._subType;
  }

  set subType(value: SubType) {
    this._subType = value;
  }

  get parent(): this {
    return this._parent;
  }

  set parent(value: this) {
    this._parent = value;
  }

  get leftNode(): this | undefined {
    return this._leftNode;
  }

  set leftNode(node: this) {
    if (!node) {
      return;
    }

    this._leftNode = node;
    node.parent = this;
  }

  get rightNode(): this | undefined {
    return this._rightNode;
  }

  set rightNode(node: this) {
    if (!node) {
      return;
    }

    this._rightNode = node;
    node.parent = this;
  }

  public constructor(value?: Token) {
    if (value) {
      this.value = value;
    }
  }
}
