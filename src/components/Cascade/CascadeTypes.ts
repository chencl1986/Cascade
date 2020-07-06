// 级联数据值类型
export declare type CascadeValue = string | number;

// 级联数据类型
export class CascadeDefaultItem {
  value?: CascadeValue;
  label?: React.ReactNode;
  children?: CascadeDefaultItem[];
  [propName: string]: any;
}

// 级联数据类型
export class CascadeItem<T extends CascadeItem<T>> {
  value?: CascadeValue;
  label?: React.ReactNode;
  children?: T[];
  [propName: string]: any;
}

// 级联选项各字段对应的字段名
export class CascadeKeys {
  valueKey: string = 'value';
  labelKey: string = 'label';
  childrenKey: string = 'children';
}
