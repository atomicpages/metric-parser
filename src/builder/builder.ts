import type {
  ParserGeneralResult,
  ParserResult,
} from "../parser/parser.result";
import { BuilderHelper } from "./builder.helper";
import { Packer } from "../packer";
import { ParserError } from "../error";
import { BuilderError } from "./builder.error";
import { TreeBuilderBase } from "../tree/tree.base";
import type { ParseData } from "../parser/parser";
import { Parser } from "../parser/parser";
import { BuilderBase } from "./builder.base";

export class Builder<T> extends BuilderBase<T> {
  protected doBuild(
    data: ParseData | T,
  ): ParserResult<T> | ParserGeneralResult {
    if (!data) {
      throw new ParserError(BuilderError.emptyData);
    }

    if (BuilderHelper.needParse(data)) {
      return this.parse(data);
    }

    if (BuilderHelper.needUnparse(data)) {
      return this.unparse(data as T);
    }
  }

  protected doParse(data: ParseData): ParserResult<T> {
    const ast = Parser.parse(data);
    const tree = this.treeBuilder.makeTree(ast);
    return Packer.makeData(tree);
  }

  protected doUnparse(data: T): ParserGeneralResult {
    const ast = this.treeBuilder.makeAst(data);
    const expression = Parser.unparse(ast);
    return Packer.makeData(expression);
  }
}
