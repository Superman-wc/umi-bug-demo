export interface EnumValue {
  name: string,
  value: string
}

export const enum LectrueTypeEnum {
  普通的 = 1,
  空缺 = 2,
  没有老师的排课比如班会自修等 = 3,
  选课包含选考学考 = 4
};

export function Enums(e?: any): Array<EnumValue> {
  return Object.keys(e).reduce((sum, value) => {
    if (parseInt(value, 10) >= 0) {
      sum.push({name: e[value], value});
    }
    return sum;
  }, new Array<EnumValue>());
}
