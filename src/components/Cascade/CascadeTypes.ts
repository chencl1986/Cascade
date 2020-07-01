// 级联数据值类型
export declare type CascadeValue = string | number

// 级联数据类型
export class CascadeItem<K = CascadeValue, V = CascadeValue> {
  code: K;
  name: V;
  children?: CascadeItem<K, V>[];
}
