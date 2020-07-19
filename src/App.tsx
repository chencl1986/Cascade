import React, { useState, useCallback } from 'react';
import './App.css';
import Cascade from './components/Cascade/Cascade';
import pcaCode from './json/pca-code.json';
import { CascadeValue, CascadeKeys } from './components/Cascade/CascadeTypes';
import getPCASelection from './services/getPCASelection';
import { Form, Button } from 'antd';
import CascadeData from './components/Cascade/CascadeData';
import { RuleObject } from 'antd/lib/form';

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
  const [pcaData, setPCAData] = useState<PCAItem[] | null>(null);
  const [changedPCAIndex, setPCAIndex] = useState<number | null>(null);
  const [asyncPCAData, setAsyncPCAData] = useState<PCAItem[] | null>(null);
  const [changedAsyncPCAIndex, setAsyncPCAIndex] = useState<number | null>(
    null
  );
  const [validateResult, setValidateResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean[]>([false, false, false]);
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
      setValidateResult(true);
    } catch (error) {
      setValidateResult(false);
      console.error(error);
    }
  }, [form]);
  const asyncPCAValidator = useCallback(
    (rule: RuleObject, value: PCAItem[]) => {
      if (Array.isArray(value) && value.length === dataSource.length) {
        const index = dataSource.findIndex((item: PCAItem[]): boolean => {
          if (item === null || item === undefined) {
            return true;
          } else {
            return false;
          }
        });
        if (index < 0) {
          return Promise.resolve();
        } else {
          return Promise.reject('请选择正确地址');
        }
      } else {
        return Promise.reject('请选择正确地址');
      }
    },
    [dataSource]
  );

  return (
    <Form className={'App'} form={form}>
      <Form.Item
        name={'PCA'}
        label={'树形级联数据'}
        extra={`已选择的数据：${
          pcaData ? JSON.stringify(pcaData) : ''
        }，变化的层级：${
          typeof changedPCAIndex === 'number' ? changedPCAIndex : ''
        }`}
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
            setPCAData(value);
            setPCAIndex(level);
          }}
        />
      </Form.Item>
      <Form.Item
        name={'AsyncPCA'}
        label={'异步级联数据'}
        extra={`已选择的数据：${
          asyncPCAData ? JSON.stringify(asyncPCAData) : ''
        }，变化的层级：${
          typeof changedAsyncPCAIndex === 'number' ? changedAsyncPCAIndex : ''
        }`}
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
          loading={loading}
          onChange={async (value: PCAItem[], level: number) => {
            setAsyncPCAData(value);
            setAsyncPCAIndex(level);
            setLoading(
              loading.map((item: boolean, index: number): boolean =>
                level + 1 === index ? true : item
              )
            );
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

              setLoading(
                loading.map((item: boolean, index: number): boolean =>
                  level + 1 === index ? false : item
                )
              );
              setDataSource(newDataSource);
            }
          }}
        />
      </Form.Item>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px',
        }}
      >
        <Button type={'primary'} onClick={onValidate}>
          校验表单
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          lineHeight: '24px',
        }}
      >
        校验结果：
        {validateResult === null ? (
          ''
        ) : validateResult ? (
          <span style={{ color: 'green', fontWeight: 'bold' }}>成功</span>
        ) : (
          <span style={{ color: 'red', fontWeight: 'bold' }}>失败</span>
        )}
      </div>
    </Form>
  );
}
export default App;
