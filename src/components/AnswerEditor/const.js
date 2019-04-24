import {mm2px} from "./helper";

/**
 * 纸张大小
 */
const PAGE_SIZE = {
  A4: {
    direction: '纵向',
    print: {
      height: 297,
      width: 210,
    },
  },
  '16K': {
    direction: '纵向',
    print: {
      width: 195,
      height: 271,
    },
  },
  '8K': {
    direction: '横向',
    print: {
      width: 420,
      height: 285,
    },
  },
};


export {
  PAGE_SIZE,
}
