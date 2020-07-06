import React, { useState } from 'react';
import './App.css';
import Cascade from './components/Cascade/Cascade';
import pcaCode from './json/pca-code.json';
import { CascadeValue, CascadeKeys } from './components/Cascade/CascadeTypes';
import getPCASelection from './services/getPCASelection';

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

function App() {
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

  return (
    <div className='App'>
      <Cascade<PCAItem>
        dataSource={pcaCode}
        cascadeKeys={pcaCascadeKeys}
        onChange={async (value: PCAItem[], level: number) => {
          console.log(value, level);
        }}
      />
      <Cascade<PCAItem>
        dataSource={dataSource}
        cascadeKeys={pcaCascadeKeys}
        onChange={async (value: PCAItem[], level: number) => {
          console.log(value, level);
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
    </div>
  );
}

export default App;
