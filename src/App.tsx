import React, { useState, useCallback } from 'react';
import './App.css';
import Cascade from './components/Cascade/Cascade';
import pcaCode from './json/pca-code.json';
import { CascadeValue, CascadeKeys } from './components/Cascade/CascadeTypes';
import getPCASelection from './services/getPCASelection';
import { Form, Button, Input } from 'antd';
import CascadeData from './components/Cascade/CascadeData';
import { RuleObject } from 'antd/lib/form';
import { StoreValue } from 'antd/lib/form/interface';

export class PCAItem {
  code: number;
  name: string;
  children?: PCAItem[];
}

export const pcaCascadeKeys: CascadeKeys = {
  valueKey: 'code',
  labelKey: 'name',
  childrenKey: 'children',
};

const pcaCascadeData = new CascadeData<PCAItem>(pcaCode, pcaCascadeKeys);

function App() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<PCAItem[][]>([
    (pcaCode as PCAItem[]).map(
      (item: PCAItem): PCAItem => ({
        ...item,
        children: undefined,
      })
    ),
    [],
    [],
  ]);
  const onValidate = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (error) {
      console.error(error);
    }
  }, []);
  const asyncPCAValidator = useCallback(
    (rule: RuleObject, value: PCAItem[]) => {
      console.log(value);
      if (Array.isArray(value) && value.length === dataSource.length) {
        const index = dataSource.findIndex((item: PCAItem[]): boolean => {
          if (item === null || item === undefined) {
            return true;
          } else {
            return false;
          }
        });
        console.log(index);
        if (index < 0) {
          return Promise.resolve();
        } else {
          return Promise.reject('请选择正确地址');
        }
      } else {
        return Promise.reject('请选择正确地址');
      }
    },
    []
  );

  return (
    <Form className={'App'} form={form}>
      <Form.Item
        name={'PCA'}
        rules={[
          {
            validator: pcaCascadeData.cascadeValidator,
            message: '请选择正确地址',
          },
        ]}
      >
        <Cascade<PCAItem>
          dataSource={pcaCascadeData}
          cascadeKeys={pcaCascadeKeys}
          onChange={async (value: PCAItem[], level: number) => {
            console.log(value, level);
          }}
        />
      </Form.Item>
      <Form.Item
        name={'AsyncPCA'}
        rules={[
          {
            validator: asyncPCAValidator,
            message: '请选择正确地址',
          },
        ]}
      >
        <Cascade<PCAItem>
          dataSource={dataSource}
          cascadeKeys={pcaCascadeKeys}
          onChange={async (value: PCAItem[], level: number) => {
            if (level < dataSource.length - 1) {
              const newCascade = await getPCASelection(
                value[level].code as CascadeValue
              );
              const newDataSource = dataSource.map(
                (cascades: PCAItem[], index: number): PCAItem[] => {
                  if (index <= level) {
                    return cascades;
                  } else if (index === level + 1) {
                    return newCascade;
                  } else {
                    return [];
                  }
                }
              );

              setDataSource(newDataSource);
            }
          }}
        />
      </Form.Item>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type={'primary'} onClick={onValidate}>
          校验表单
        </Button>
      </div>
    </Form>
  );
}
export default App;
