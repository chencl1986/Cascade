import React, { useState } from 'react';
import './App.css';
import Cascade from './components/Cascade/Cascade';
import pcaCode from './json/pca-code.json';
import { CascadeItem } from './components/Cascade/CascadeTypes';
import getPCASelection from './services/getPCASelection';

function App() {
  const [dataSource, setDataSource] = useState<CascadeItem[][]>([
    (pcaCode as CascadeItem[]).map(
      (item: CascadeItem): CascadeItem => ({
        ...item,
        children: undefined,
      })
    ),
    [],
    [],
  ]);

  return (
    <div className='App'>
      {/* <Cascade
        dataSource={pcaCode}
        onChange={async (value: CascadeItem[], level: number) => {
          // await getPCASelection()
        }}
      /> */}
      <Cascade
        dataSource={dataSource}
        onChange={async (value: CascadeItem[], level: number) => {
          console.log(value, level);
          if (level < dataSource.length - 1) {
            const newCascade = await getPCASelection(value[level].code);
            const newDataSource = dataSource.map(
              (cascades: CascadeItem[], index: number): CascadeItem[] => {
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
