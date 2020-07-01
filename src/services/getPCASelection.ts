import pcaCode from '../json/pca-code.json';
import { CascadeValue, CascadeItem } from '../components/Cascade/CascadeTypes';
import CascadeData from '../components/Cascade/CascadeData';

function sleep(t: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t);
  });
}

const pcaData = new CascadeData(pcaCode);

// 模拟通过网络请求获取级联选项
export default async function getPCASelection(
  code: CascadeValue
): Promise<CascadeItem[]> {
  return new Promise(async (resolve, reject) => {
    await sleep(500);
    resolve(
      pcaData.getSelectionByCode(code).map(
        (item: CascadeItem): CascadeItem => {
          return {
            ...item,
            children: undefined,
          };
        }
      )
    );
  });
}
