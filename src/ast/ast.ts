import { AbstractSyntaxTreeBase } from "./ast.base";
import { TokenHelper } from "../token/token.helper";
import { Type, literal } from "../token/token";
import type { Maybe } from "../types";

export class AbstractSyntaxTree extends AbstractSyntaxTreeBase {
  get expression(): string[] {
    return this.makeExpression();
  }

  private getParentOperator(): Maybe<AbstractSyntaxTree> {
    if (this.isRoot()) {
      return undefined;
    }

    return this.parent.findOperator();
  }

  private isNeededBracket(): boolean {
    const parentOperator = this.getParentOperator();

    return (
      parentOperator &&
      (TokenHelper.getPrecedenceDiff(parentOperator.value, this.value) > 0 ||
        (TokenHelper.getPrecedenceDiff(parentOperator.value, this.value) >= 0 &&
          this.parent.rightNode === this))
    );
  }

  private findOperator(): AbstractSyntaxTree {
    if (this.type === Type.Operator) {
      return this;
    }

    return this.parent.findOperator();
  }

  private makeExpression(): string[] {
    return this.type === Type.Operator
      ? this.makeOperatorExpression()
      : this.makeValueExpression();
  }

  private makeOperatorClause(): string[] {
    return [
      ...(this.leftNode ? this.leftNode.expression : []),
      this.value,
      ...(this.rightNode ? this.rightNode.expression : []),
    ];
  }

  private makeOperatorExpression(): string[] {
    const expression = this.makeOperatorClause();
    return this.isNeededBracket() ? this.wrapBracket(expression) : expression;
  }

  private makeValueExpression(): string[] {
    return [this.value];
  }

  private wrapBracket(expression: string[]): string[] {
    return [literal.BracketOpen, ...expression, literal.BracketClose];
  }
}
