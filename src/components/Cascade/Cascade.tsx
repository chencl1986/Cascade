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
import { CascadeItem, CascadeValue } from './CascadeTypes';

// 常量

// 公共方法
import CascadeData from './CascadeData';

// 组件
import { Row, Col, Select } from 'antd';

const Option = Select.Option;

// 网络请求接口

// 组件方法

// 组件类型
export interface Props {
  value?: CascadeItem[];
  onChange?: (value: CascadeItem[], level: number) => void;
  rowProps?: RowProps;
  colProps?: ColProps;
  dataSource?: CascadeItem[] | CascadeData | CascadeItem[][];
}

export class State {
  value: CascadeItem[] = [];
  keys: string[] = [];
}

class Cascade extends React.Component<Props, State> {
  static defaultProps: Props = {
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

  private buildCascadeMaps(
    dataSource: CascadeItem[][]
  ): Map<CascadeValue, CascadeItem>[] {
    let cascadeMaps: Map<CascadeValue, CascadeItem>[] = [];

    for (let i = 0; i < dataSource.length; i++) {
      if (!cascadeMaps[i]) {
        cascadeMaps[i] = new Map<CascadeValue, CascadeItem>();
      }
      for (let j = 0; j < dataSource[i].length; j++) {
        cascadeMaps[i].set(dataSource[i][j].code, dataSource[i][j]);
      }
    }

    return cascadeMaps;
  }

  private cascadeData: CascadeData;

  cascadeMaps: Map<CascadeValue, CascadeItem>[] = [];

  constructor(props: Props) {
    super(props);

    const dataSource = this.props.dataSource;
    let keys: string[] = [];

    if (dataSource) {
      if (dataSource instanceof CascadeData) {
        this.cascadeData = dataSource;
      } else if (!Array.isArray(dataSource[0])) {
        this.cascadeData = new CascadeData(dataSource as CascadeItem[]);
      } else {
        keys = Cascade.buildKeys(dataSource.length);
        this.cascadeMaps = this.buildCascadeMaps(dataSource as CascadeItem[][]);
      }
    }

    this.state = {
      ...new State(),
      keys,
    };
  }

  // 强制更新级联组件数据（不是一个好办法，待改进）
  public updateDataSource = (dataSource: CascadeItem[]): void => {
    this.cascadeData = new CascadeData(dataSource || []);
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
  private onSyncChange(code: CascadeValue, level: number): CascadeItem[] {
    const name = this.cascadeData.getName(level, code) || '';
    let value = [...this.state.value];

    value[level] = {
      code,
      name,
    };

    if (!value[level]) {
      for (
        let index = level + 1;
        index < this.cascadeData.getLength();
        index++
      ) {
        const cascade = this.cascadeData.getFirstCascade(
          index,
          value[index - 1].code
        );

        if (cascade) {
          value[index] = cascade;
        } else {
          break;
        }
      }
    }

    return value;
  }

  // 当异步获取级联选项时
  private onAsyncChange(code: CascadeValue, level: number): CascadeItem[] {
    let value = [...this.state.value];

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
  private getSelections(): CascadeItem[][] {
    if (this.cascadeData) {
      return this.cascadeData.getSelections(this.state.value);
    } else {
      return (this.props.dataSource as CascadeItem[][]) || [];
    }
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    let nextState: Partial<State> = {};
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

  getSnapshotBeforeUpdate(prevProps: Props, prevState: State): null {
    if (prevProps.dataSource && this.props.dataSource) {
      if (
        JSON.stringify(prevProps.dataSource) !==
        JSON.stringify(this.props.dataSource)
      ) {
        this.cascadeMaps = this.buildCascadeMaps(
          this.props.dataSource as CascadeItem[][]
        );
      }
    }

    return null;
  }

  render() {
    const keys = this.getKeys();

    return (
      <Row {...this.props.rowProps}>
        {this.getSelections().map(
          (cascades: CascadeItem[], level: number): React.ReactNode => {
            const value =
              this.state.value[level] && this.state.value[level].code;

            return (
              <Col key={keys[level]} {...this.props.colProps}>
                <Select<CascadeValue>
                  value={value}
                  placeholder={'请选择'}
                  onChange={(value: CascadeValue): void => {
                    this.onChange(value, level);
                  }}
                >
                  {cascades.map(
                    (cascade: CascadeItem): React.ReactNode => {
                      return (
                        <Option
                          key={cascade.code.toString()}
                          value={cascade.code}
                        >
                          {cascade.name}
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
