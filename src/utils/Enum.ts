export interface EnumValue {
  name: string,
  value: string
}

export const enum SemesterTypeEnum {
  上学期 = 1,
  下学期 = 2
};

export const enum ClassTypeEnum {
  行政班 = 1,
  选考班 = 3,
  学考班 = 4,
}

export const enum GenderEnum {
  女 = 0,
  男 = 1
}

export const enum CourseTypeEnum {
  非学考选考 = 1,
  学考 = 2,
  选考 = 3
}

export function Enums(e?: any): Array<EnumValue> {
  return Object.keys(e).reduce((sum, value) => {
    if (parseInt(value, 10) >= 0) {
      sum.push({name: e[value], value});
    }
    return sum;
  }, new Array<EnumValue>());
}
