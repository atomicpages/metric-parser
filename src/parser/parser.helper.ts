import type { ParseData } from "./parser";

export class ParserHelper {
  public static getArray(data: ParseData): string[] {
    return typeof data === "string" ? this.stringToArray(data) : data;
  }

  private static stringToArray(value: string): string[] {
    return value.split("");
  }
}
