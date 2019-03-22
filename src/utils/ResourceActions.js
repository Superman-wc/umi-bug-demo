import {Enums, URLResourceEnum} from './Enum';

export const Actions = Enums(URLResourceEnum).map(it => {
  it.value = parseInt(it.value, 10);
  it.mask = it.value;
  // it.bit = uMask(it.value);
  return it;
});

export default function resourceActions(mask) {
  return Actions.reduce((arr, action) => {

    if ((mask & action.mask) === action.mask) {
      arr.push({label: action.name, value: action.mask});
    }
    return arr;
  }, []);
}
