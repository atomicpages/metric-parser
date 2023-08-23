export type Node = Tree | Operand;

export type Tree = {
  operator: string;
  operand1: Node;
  operand2: Node;
};

export type Operand = {
  value: ValueObject;
};

export type ValueObject = {
  type: string;
  item?: ItemValue;
  unit?: UnitValue;
};

export type Value = ItemValue | UnitValue;

export type ItemValue = any;

export type UnitValue = string | number;
