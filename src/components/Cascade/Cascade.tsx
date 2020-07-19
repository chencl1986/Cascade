/**
 * Created by xm_chenli@huayun.com on 2019/11/21 14:30.
 */

// 第三方库
import React from 'react';
import md5 from 'md5';

// 样式表
import './Cascade.css';

// 引用类型
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import {
  CascadeItem,
  CascadeValue,
  CascadeKeys,
  CascadeDefaultItem,
} from './CascadeTypes';

// 常量

// 公共方法
import CascadeData from './CascadeData';

// 组件
import { Row, Col, Select } from 'antd';

const Option = Select.Option;

// 网络请求接口

// 组件方法

// 组件类型
interface Props<T> {
  cascadeKeys?: CascadeKeys; // 自定义 dataSource 中 value label children 的字段
  value?: T[]; // 指定当前选中的条目
  onChange?: (value: T[], level: number) => void; // 选中选项时，调用此函数
  rowProps?: RowProps; // 行排列方式，可参考https://ant.design/components/grid-cn/
  colProps?: ColProps; // 列排列方式
  loading?: boolean[]; // 选择框loading装填
  dataSource?: T[] | CascadeData<T> | T[][]; // 可选项数据源
}

export class State<T> {
  value: T[] = [];
  keys: string[] = [];
}

class Cascade<
  T extends CascadeItem<T> = CascadeDefaultItem
> extends React.Component<Props<T>, State<T>> {
  static defaultProps = {
    cascadeKeys: new CascadeKeys(),
    rowProps: {
      gutter: 10,
    },
    colProps: {
      xs: 24,
      sm: 24,
      md: 8,
      lg: 8,
      xl: 8,
    },
  };

  private static buildKeys(length: number): string[] {
    let keys: string[] = [];

    for (let index = 0; index < length; index++) {
      keys.push(md5(Math.random().toString()));
    }

    return keys;
  }

  private buildCascadeMaps(dataSource: T[][]): Map<CascadeValue, T>[] {
    let cascadeMaps: Map<CascadeValue, T>[] = [];
    const cascadeKeys = this.props.cascadeKeys || new CascadeKeys();

    for (let i = 0; i < dataSource.length; i++) {
      if (!cascadeMaps[i]) {
        cascadeMaps[i] = new Map<CascadeValue, T>();
      }
      for (let j = 0; j < dataSource[i].length; j++) {
        if (dataSource[i][j]) {
          cascadeMaps[i].set(
            dataSource[i][j][cascadeKeys.valueKey],
            dataSource[i][j]
          );
        }
      }
    }

    return cascadeMaps;
  }

  private cascadeData: CascadeData<T>;

  cascadeMaps: Map<CascadeValue, T>[] = [];

  constructor(props: Props<T>) {
    super(props);

    const dataSource = this.props.dataSource;
    let keys: string[] = [];

    if (dataSource) {
      if (dataSource instanceof CascadeData) {
        this.cascadeData = dataSource;
      } else if (!Array.isArray(dataSource[0])) {
        this.cascadeData = new CascadeData(
          dataSource as T[],
          this.props.cascadeKeys || new CascadeKeys()
        );
      } else {
        keys = Cascade.buildKeys(dataSource.length);
        this.cascadeMaps = this.buildCascadeMaps(dataSource as T[][]);
      }
    }

    this.state = {
      ...new State(),
      keys,
    };
  }

  // 强制更新级联组件数据（不是一个好办法，待改进）
  public updateDataSource = (dataSource: T[]): void => {
    this.cascadeData = new CascadeData(
      dataSource || [],
      this.props.cascadeKeys || new CascadeKeys()
    );
    this.forceUpdate();
  };

  // 选择级联选项
  private onChange = async (code: CascadeValue, level: number) => {
    let value = [];

    if (this.cascadeData) {
      value = this.onSyncChange(code, level);
    } else {
      value = this.onAsyncChange(code, level);
    }

    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }

    // 触发onChange
    const onChange = this.props.onChange;
    onChange && onChange(value, level);
  };

  // 当级联选项
  private onSyncChange(value: CascadeValue, level: number): T[] {
    const cascadeKeys = this.props.cascadeKeys || new CascadeKeys();
    const selectedValue = this.cascadeData.getItem(level, value);
    let selectedValues = [...this.state.value];
    const lastSelectedValue =
      selectedValues[level] && selectedValues[level].code;

    if (selectedValue) {
      selectedValues[level] = selectedValue;
    }

    if (
      !selectedValues[level] ||
      lastSelectedValue !== selectedValues[level].code
    ) {
      for (
        let index = level + 1;
        index < this.cascadeData.getLength();
        index++
      ) {
        const cascade = this.cascadeData.getFirstCascade(
          index,
          selectedValues[index - 1][cascadeKeys.valueKey]
        );

        if (cascade) {
          selectedValues[index] = cascade;
        } else {
          break;
        }
      }
    }

    return selectedValues;
  }

  // 当异步获取级联选项时
  private onAsyncChange(code: CascadeValue, level: number): T[] {
    let value = this.state.value.slice(0, level);

    if (this.cascadeMaps[level]) {
      const selectedValue = this.cascadeMaps[level].get(code);

      if (selectedValue) {
        value[level] = selectedValue;
      }
    }

    return value;
  }

  private getKeys(): string[] {
    if (this.cascadeData) {
      return this.cascadeData.getKeys();
    } else {
      return this.state.keys;
    }
  }

  // 获取级联选项
  private getSelections(): T[][] {
    if (this.cascadeData) {
      return this.cascadeData.getSelections(this.state.value);
    } else {
      return (this.props.dataSource as T[][]) || [];
    }
  }

  static getDerivedStateFromProps(
    nextProps: Props<any>,
    prevState: State<any>
  ): Partial<State<any>> | null {
    let nextState: Partial<State<any>> = {};
    const keysLength = prevState.keys.length;

    if (
      prevState.keys.length &&
      Array.isArray(nextProps.dataSource) &&
      keysLength !== nextProps.dataSource.length
    ) {
      const dataSourceLength = nextProps.dataSource.length;

      if (keysLength < dataSourceLength) {
        nextState.keys = [
          ...prevState.keys,
          ...Cascade.buildKeys(dataSourceLength - keysLength),
        ];
      } else {
        nextState.keys = prevState.keys.slice(0, dataSourceLength);
      }
    }

    if ('value' in nextProps) {
      nextState.value = nextProps.value || [];
    }

    return nextState;
  }

  componentDidUpdate(prevProps: Props<T>, prevState: State<T>) {
    if (prevProps.dataSource && this.props.dataSource) {
      if (
        JSON.stringify(prevProps.dataSource) !==
        JSON.stringify(this.props.dataSource)
      ) {
        this.cascadeMaps = this.buildCascadeMaps(
          this.props.dataSource as T[][]
        );
      }
    }
  }

  render() {
    const keys = this.getKeys();
    const cascadeKeys = this.props.cascadeKeys || new CascadeKeys();
    const loading = this.props.loading;

    return (
      <Row {...this.props.rowProps}>
        {this.getSelections().map(
          (cascades: T[], level: number): React.ReactNode => {
            const value =
              this.state.value[level] &&
              this.state.value[level][cascadeKeys.valueKey];

            return (
              <Col key={keys[level]} {...this.props.colProps}>
                <Select<CascadeValue>
                  value={value}
                  placeholder={'请选择'}
                  loading={
                    Array.isArray(loading) && loading[level]
                      ? loading[level]
                      : false
                  }
                  onChange={(value: CascadeValue): void => {
                    this.onChange(value, level);
                  }}
                >
                  {cascades.map(
                    (cascade: T): React.ReactNode => {
                      return (
                        <Option
                          key={cascade[cascadeKeys.valueKey].toString()}
                          value={cascade[cascadeKeys.valueKey]}
                        >
                          {cascade[cascadeKeys.labelKey]}
                        </Option>
                      );
                    }
                  )}
                </Select>
              </Col>
            );
          }
        )}
      </Row>
    );
  }
}

export default Cascade;
