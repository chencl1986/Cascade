/**
 * Created by xm_chenli@huayun.com on 2019/11/21 13:43.
 */

// 引用类型
import { CascadeItem, CascadeValue } from './CascadeTypes';

// 公共方法
import md5 from 'md5';

// 收集级联选择框数据
class CascadeData {
  constructor(cascades: CascadeItem[], selectionLength?: number) {
    console.log('CascadeData constructor');
    this.dataSource = cascades;
    this.initRootChildrenMaps(cascades);
    this.init(cascades);
    console.log(this.codeRoutesMap);
    console.log(this.firstCascadeMaps);
    console.log(this.childrenMaps);
    console.log(this.codeChildrenMap);
    this.length =
      typeof selectionLength === 'number'
        ? selectionLength
        : this.codeNameMaps.length;
    this.initKeys();
  }

  private dataSource: CascadeItem[] = [];

  // 级联数据深度
  private length: number = 0;

  // 用于表单项循环的Key
  private keys: string[] = [];

  // 以code-name形式存储的级联数据
  private codeNameMaps: Map<CascadeValue, CascadeValue>[] = [];

  // 以name-code形式存储的级联数据
  private nameCodeMaps: Map<CascadeValue, CascadeValue>[] = [];

  // 储存查询到当前节点的路径
  private codeRoutesMap: Map<CascadeValue, number[]> = new Map<
    CascadeValue,
    number[]
  >();

  // 存储所有选项中的第一个值，用于选择新选项时，重置后续级联选项
  private firstCascadeMaps: Map<CascadeValue, CascadeItem>[] = [
    new Map<'root', CascadeItem>(),
  ];

  // 存储所有选项数据，可通过每一
  private childrenMaps: Map<CascadeValue | 'root', CascadeItem[]>[] = [
    new Map<'root', CascadeItem[]>(),
  ];

  // 按code存储相应的children
  private codeChildrenMap: Map<CascadeValue, CascadeItem[]> = new Map<
    CascadeValue,
    CascadeItem[]
  >();

  // 初始化省市区数据
  private init(
    data: CascadeItem[],
    level: number = 0,
    parentIndexes: number[] = [0]
  ) {
    data.forEach((item: CascadeItem, index: number): void => {
      this.setMap(item, level, parentIndexes);
      if (item.children) {
        this.init(item.children, level + 1, [...parentIndexes, index]);
      }
    });
  }

  // 初始化选择框的Key
  private initKeys(): void {
    for (let i = 0; i < this.length; i++) {
      this.keys.push(md5(Math.random().toString()));
    }
  }

  // 为级联Map数据设置值
  private setMap(
    cascade: CascadeItem,
    level: number,
    parentIndexes: number[]
  ): void {
    if (!this.codeNameMaps[level]) {
      this.codeNameMaps.push(new Map());
    }
    this.codeNameMaps[level].set(cascade.code, cascade.name);

    if (!this.nameCodeMaps[level]) {
      this.nameCodeMaps.push(new Map<CascadeValue, CascadeValue>());
    }
    this.nameCodeMaps[level].set(cascade.name, cascade.code);
    this.codeRoutesMap.set(cascade.code, parentIndexes);
    this.codeChildrenMap.set(cascade.code, cascade.children || []);

    if (cascade.children) {
      !this.childrenMaps[level + 1] &&
        this.childrenMaps.push(new Map<CascadeValue, CascadeItem[]>());
      this.childrenMaps[level + 1].set(cascade.code, cascade.children || []);

      // 存储每个层级的第一个选项
      !this.firstCascadeMaps[level + 1] &&
        this.firstCascadeMaps.push(new Map<CascadeValue, CascadeItem>());
      cascade.children[0] &&
        this.firstCascadeMaps[level + 1].set(cascade.code, {
          code: cascade.children[0].code,
          name: cascade.children[0].name,
        });
    }
  }

  // 初始化childrenMaps，提供每个层级的初始Map，第一层级
  private initRootChildrenMaps(cascades: CascadeItem[]): void {
    this.childrenMaps[0].set(
      'root',
      cascades.map(
        ({ code, name }: CascadeItem): CascadeItem => {
          return {
            code,
            name,
          };
        }
      )
    );
    this.codeChildrenMap.set('root', cascades);
    cascades[0] &&
      this.firstCascadeMaps[0].set('root', {
        code: cascades[0].code,
        name: cascades[0].name,
      });
  }

  /**
   * getOriginalDataSource 获取原始数据
   * @returns {CascadeItem[]}  原始数据
   */
  public getDataSource(): CascadeItem[] {
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
   * @param {CascadeValue} code  级联数据Code
   * @returns {CascadeValue | undefined}  通过级联当前层Code获取相应名称
   */
  public getName(level: number, code: CascadeValue): CascadeValue | undefined {
    return this.codeNameMaps[level].get(code);
  }

  /**
   * getCode
   * @param {number} level  级联层级
   * @param {CascadeValue} name  级联数据名称
   * @returns {CascadeValue | undefined}  通过级联当前层名称获取相应Code
   */
  public getCode(level: number, name: CascadeValue): CascadeValue | undefined {
    return this.nameCodeMaps[level].get(name);
  }

  /**
   * getSelection
   * @param {number} level  级联层级
   * @param {CascadeValue} code  级联数据Code
   * @returns {CascadeItem[] | undefined } 通过级联当前层Code获取子集
   */
  public getSelection(level?: number, code?: CascadeValue): CascadeItem[] {
    if (code && level) {
      return this.childrenMaps[level].get(code) || [];
    }
    return [];
  }

  /**
   * getSelectionByCode
   * @param {CascadeValue} code  级联数据Code
   * @returns {CascadeItem[] | undefined } 通过级联当前层Code获取子集
   */
  public getSelectionByCode(code?: CascadeValue): CascadeItem[] {
    if (code) {
      return this.codeChildrenMap.get(code) || [];
    }
    return [];
  }

  /**
   * getSelections
   * @param {CascadeItem[]} cascades  已选择的级联数据
   * @returns {CascadeItem[][]}  供选择的级联数据
   */
  public getSelections(cascades: CascadeItem[]): CascadeItem[][] {
    let result: CascadeItem[][] = [this.childrenMaps[0].get('root') || []];

    if (this.length) {
      for (let index = 0; index < this.length; index++) {
        const element = cascades[index];

        if (index < this.length - 1) {
          result.push(
            (element && this.childrenMaps[index + 1].get(element.code)) || []
          );
        }
      }
    }

    return result;
  }

  /**
   * getFirstCascade
   * @param {number} level  级联层级
   * @param {CascadeValue} code  级联数据Code
   * @returns {CascadeItem}  每层级项目的第一个选项
   */
  public getFirstCascade(
    level: number,
    code: CascadeValue
  ): CascadeItem | undefined {
    if (!level) {
      return this.firstCascadeMaps[0].get('root');
    }

    return this.firstCascadeMaps[level].get(code);
  }

  /**
   * validateCascades 校验已选择的Cascade数据是否合法，但不保证数据是否在选项中存在
   * @param {CascadeItem[]} cascades  级联层级
   * @returns {boolean}  校验结果
   */
  public static validateCascades(cascades: CascadeItem[]): boolean {
    if (Array.isArray(cascades) && cascades.length) {
      for (let index = 0; index < cascades.length; index++) {
        const element = cascades[index];
        if (!element || element.code === undefined || element.code === null) {
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
   * @param {CascadeItem[]} cascades  已选择的级联数据
   * @param {any} callback  callback函数，有传参表示校验错误
   * @param {any} source  当前表单所有数据
   * @param {any} options  表单项默认选项
   */
  public static cascadeValidator = (
    rule: any,
    cascades: CascadeItem[],
    callback: any,
    source?: any,
    options?: any
  ): void => {
    if (CascadeData.validateCascades(cascades)) {
      callback();
    } else {
      callback(
        rule.message || options.messages.required.replace(/%s/, rule.field)
      );
    }
  };
}

export default CascadeData;
