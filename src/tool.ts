import { ParserGeneralResult } from './parser/parser.result';
import { Builder } from './builder';
import { Tree } from './tree/simple.tree/type';

const _MODULE_VERSION_ = '0.0.3';

export type ConvertData = ParseData | UnparseData;

export type ParseData = string | string[];

export type UnparseData = Tree;

export function convert(formula: ConvertData): ParserGeneralResult {
    const builder = new Builder(formula);
    return builder.build();
}

export function getVersion() {
    return _MODULE_VERSION_;
}
