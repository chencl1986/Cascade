import { PCAItem } from '../App';
import pcaCode from '../json/pca-code.json';
import { CascadeValue } from '../components/Cascade/CascadeTypes';
import CascadeData from '../components/Cascade/CascadeData';

function sleep(t: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t);
  });
}

const pcaData = new CascadeData<PCAItem>(pcaCode, {
  valueKey: 'code',
  labelKey: 'name',
  childrenKey: 'children',
});

// 模拟通过网络请求获取级联选项
export default async function getPCASelection(
  code: CascadeValue
): Promise<PCAItem[]> {
  return new Promise(async (resolve, reject) => {
    await sleep(2000);
    resolve(
      pcaData.getSelectionByValue(code).map(
        (item: PCAItem): PCAItem => {
          let newItem = { ...item };
          delete newItem.children;
          return newItem;
        }
      )
    );
  });
}
