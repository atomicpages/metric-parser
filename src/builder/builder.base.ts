import type { ParseData } from "../parser/parser";
import type {
  ParserGeneralResult,
  ParserResult,
} from "../parser/parser.result";
import { ParserError } from "../error";
import { Packer } from "../packer";
import type { TreeBuilderBase } from "../tree/tree.base";
import type { BuilderInterface } from "./builder.interface";
import { GeneralError } from "../error.value";

export class BuilderBase<T> implements BuilderInterface<T> {
  public constructor(protected treeBuilder: TreeBuilderBase<T>) {}

  build(data: ParseData | T): ParserGeneralResult | ParserResult<T> {
    return this.try(() => this.doBuild(data));
  }

  public parse(data: ParseData): ParserResult<T> {
    return this.try(() => this.doParse(data));
  }

  public unparse(data: T): ParserGeneralResult {
    return this.try(() => this.doUnparse(data));
  }

  protected handleError(error: ParserError): ParserResult<string> {
    return Packer.makeError(error);
  }

  protected try<K extends ParserGeneralResult>(
    tryFunc: (...args: any[]) => K,
  ): K {
    try {
      return tryFunc();
    } catch (error) {
      return this.handleError(error) as K;
    }
  }

  protected doBuild(
    data: ParseData | T,
  ): ParserResult<T> | ParserGeneralResult {
    throw new ParserError(GeneralError.methodNotImplemented);
  }

  protected doParse(data: ParseData): ParserResult<T> {
    throw new ParserError(GeneralError.methodNotImplemented);
  }

  protected doUnparse(data: T): ParserGeneralResult {
    throw new ParserError(GeneralError.methodNotImplemented);
  }
}
