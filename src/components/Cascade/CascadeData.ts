/**
 * Created by xm_chenli@huayun.com on 2019/11/21 13:43.
 */

// 引用类型
import {
  CascadeItem,
  CascadeValue,
  CascadeKeys,
  CascadeDefaultItem,
} from './CascadeTypes';

// 公共方法
import md5 from 'md5';

// 收集级联选择框数据
class CascadeData<T extends CascadeItem<T> = CascadeDefaultItem> {
  constructor(cascades: T[], { valueKey, labelKey, childrenKey }: CascadeKeys) {
    this.dataSource = cascades;
    this.valueKey = valueKey;
    this.labelKey = labelKey;
    this.childrenKey = childrenKey;
    this.initRootChildrenMaps(cascades);
    this.init(cascades);
    this.length = this.valueLabelMaps.length;
    this.initKeys();
  }

  private valueKey: string = 'value';

  private labelKey: string = 'label';

  private childrenKey: string = 'children';

  private dataSource: T[] = [];

  // 级联数据深度
  private length: number = 0;

  // 用于表单项循环的Key
  private keys: string[] = [];

  // 以code-item形式存储的级联数据
  private valueItemMaps: Map<CascadeValue, T>[] = [];

  // 以code-name形式存储的级联数据
  private valueLabelMaps: Map<CascadeValue, React.ReactNode>[] = [];

  // 储存查询到当前节点的路径
  private codeRoutesMap: Map<CascadeValue, number[]> = new Map<
    CascadeValue,
    number[]
  >();

  // 存储所有选项中的第一个值，用于选择新选项时，重置后续级联选项
  private firstCascadeMaps: Map<CascadeValue, T>[] = [new Map<'root', T>()];

  // 存储所有选项数据，可通过层级和Value获取下一级的选项
  private childrenMaps: Map<CascadeValue | 'root', T[]>[] = [
    new Map<'root', T[]>(),
  ];

  // 按code存储相应的children
  private codeChildrenMap: Map<CascadeValue, T[]> = new Map<
    CascadeValue,
    T[]
  >();

  // 初始化省市区数据
  private init(data: T[], level: number = 0, parentIndexes: number[] = [0]) {
    data.forEach((item: T, index: number): void => {
      this.setMap(item, level, parentIndexes);
      if (item[this.childrenKey]) {
        this.init(item[this.childrenKey], level + 1, [...parentIndexes, index]);
      }
    });
  }

  // 初始化选择框的Key
  private initKeys(): void {
    for (let i = 0; i < this.length; i++) {
      this.keys.push(md5(Math.random().toString()));
    }
  }

  // 删除当前节点的children
  private removeChildren(cascade: T): T {
    let newCascade = { ...cascade };
    delete newCascade[this.childrenKey];
    return newCascade;
  }

  // 为级联Map数据设置值
  private setMap(cascade: T, level: number, parentIndexes: number[]): void {
    if (!this.valueItemMaps[level]) {
      this.valueItemMaps.push(new Map<CascadeValue, T>());
    }
    if (cascade[this.labelKey]) {
      this.valueItemMaps[level].set(
        cascade[this.valueKey],
        this.removeChildren(cascade)
      );
    }

    if (!this.valueLabelMaps[level]) {
      this.valueLabelMaps.push(new Map<CascadeValue, React.ReactNode>());
    }
    if (cascade[this.labelKey]) {
      this.valueLabelMaps[level].set(
        cascade[this.valueKey],
        cascade[this.labelKey]
      );
    }

    this.codeRoutesMap.set(cascade[this.valueKey], parentIndexes);
    this.codeChildrenMap.set(
      cascade[this.valueKey],
      cascade[this.childrenKey]
        ? cascade[this.childrenKey].map(
            (cascade: T): T => this.removeChildren(cascade)
          )
        : []
    );

    if (cascade.children) {
      !this.childrenMaps[level + 1] &&
        this.childrenMaps.push(new Map<CascadeValue, T[]>());
      this.childrenMaps[level + 1].set(
        cascade[this.valueKey],
        cascade[this.childrenKey]
          ? cascade[this.childrenKey].map(
              (cascade: T): T => this.removeChildren(cascade)
            )
          : []
      );

      // 存储每个层级的第一个选项
      !this.firstCascadeMaps[level + 1] &&
        this.firstCascadeMaps.push(new Map<CascadeValue, T>());
      if (cascade[this.childrenKey][0]) {
        this.firstCascadeMaps[level + 1].set(
          cascade[this.valueKey],
          this.removeChildren(cascade[this.childrenKey][0])
        );
      }
    }
  }

  // 初始化childrenMaps，提供每个层级的初始Map，第一层级
  private initRootChildrenMaps(cascades: T[]): void {
    this.childrenMaps[0].set(
      'root',
      cascades.map((cascade: T): T => this.removeChildren(cascade))
    );
    this.codeChildrenMap.set(
      'root',
      cascades.map((cascade: T): T => this.removeChildren(cascade))
    );
    if (cascades[0]) {
      this.firstCascadeMaps[0].set('root', this.removeChildren(cascades[0]));
    }
  }

  /**
   * getOriginalDataSource 获取原始数据
   * @returns {T[]}  原始数据
   */
  public getDataSource(): T[] {
    return this.dataSource;
  }

  /**
   * getKeys 获取用于表单项循环的Key
   * @returns {string[]}  表单项循环的Key
   */
  public getKeys(): string[] {
    return this.keys;
  }

  /**
   * getLength 获取级联的长度
   * @returns {number}  级联的长度
   */
  public getLength(): number {
    return this.length;
  }

  /**
   * getName
   * @param {number} level  级联层级
   * @param {CascadeValue} value  级联数据Value
   * @returns {T | undefined}  通过级联当前层Value获取相应选项
   */
  public getItem(level: number, value: CascadeValue): T | undefined {
    return this.valueItemMaps[level].get(value);
  }

  /**
   * getName
   * @param {number} level  级联层级
   * @param {CascadeValue} value  级联数据Value
   * @returns {React.ReactNode}  通过级联当前层Value获取相应名称
   */
  public getLabel(level: number, value: CascadeValue): React.ReactNode {
    return this.valueLabelMaps[level].get(value);
  }

  /**
   * getSelection
   * @param {number} level  级联层级
   * @param {CascadeValue} value  级联数据value
   * @returns {T[] | undefined } 通过级联当前层value获取子集
   */
  public getSelection(level?: number, value?: CascadeValue): T[] {
    if (value && level) {
      return this.childrenMaps[level].get(value) || [];
    }
    return [];
  }

  /**
   * getSelectionByValue
   * @param {CascadeValue} value  级联数据value
   * @returns {T[] | undefined } 通过级联当前层value获取子集
   */
  public getSelectionByValue(value?: CascadeValue): T[] {
    if (value) {
      return this.codeChildrenMap.get(value) || [];
    }
    return [];
  }

  /**
   * getSelections
   * @param {T[]} cascades  已选择的级联数据
   * @returns {T[][]}  供选择的级联数据
   */
  public getSelections(cascades: T[]): T[][] {
    let result: T[][] = [this.childrenMaps[0].get('root') || []];

    if (this.length) {
      for (let index = 0; index < this.length; index++) {
        const cascade = cascades[index];

        if (index < this.length - 1) {
          result.push(
            (cascade &&
              this.childrenMaps[index + 1].get(cascade[this.valueKey])) ||
              []
          );
        }
      }
    }

    return result;
  }

  /**
   * getFirstCascade
   * @param {number} level  级联层级
   * @param {CascadeValue} value  级联数据value
   * @returns {T}  每层级项目的第一个选项
   */
  public getFirstCascade(level: number, value: CascadeValue): T | undefined {
    if (!level) {
      return this.firstCascadeMaps[0].get('root');
    }

    return this.firstCascadeMaps[level].get(value);
  }

  /**
   * validateCascades 校验已选择的Cascade数据是否合法，但不保证数据是否在选项中存在
   * @param {T[]} cascades  级联层级
   * @returns {boolean}  校验结果
   */
  public validateCascades(cascades: T[]): boolean {
    if (Array.isArray(cascades) && cascades.length) {
      for (let index = 0; index < cascades.length; index++) {
        const cascade = cascades[index];

        if (
          !cascade ||
          cascade[this.valueKey] === undefined ||
          cascade[this.valueKey] === null
        ) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  /**
   * cascadeValidator 基于rc-form的校验方法
   * @param {any} rule  当前表单项校验规则
   * @param {T[]} cascades  已选择的级联数据
   * @param {any} callback  callback函数，有传参表示校验错误
   * @param {any} source  当前表单所有数据
   * @param {any} options  表单项默认选项
   */
  public cascadeValidator = (
    rule: any,
    cascades: T[],
    callback: any,
    source?: any,
    options?: any
  ): void => {
    if (this.validateCascades(cascades)) {
      callback();
    } else {
      callback(
        rule.message || options.messages.required.replace(/%s/, rule.field)
      );
    }
  };
}

export default CascadeData;
