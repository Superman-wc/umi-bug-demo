export interface EnumValue {
  name: string,
  value: string
}

export const enum BuildingTypeEnum {
  教学区 = 1,
  生活区 = 2
}

export const enum GradeIndexEnum {
  高一 = 10,
  高二 = 11,
  高三 = 12
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

export const enum NoticeTypeEnum {
  校园新闻 = 1,
  校园公告 = 2,
  年级公告 = 3,
}

export const enum URLResourceEnum {
  查看列表 = 1,
  创建 = 4,
  查看详情 = 8,
  修改 = 32,
  删除 = 64,
  特殊操作 = 128,
}

export const enum EnableStatusEnum {
  默认 = 1,
  禁用 = 5,
  启用 = 9
}

export const enum URLResourceCategoryEnum {
  系统 = 0,
  管理员 = 3,
  设置 = 4,
  管理 = 5,
  排课 = 6
}

export const enum MenuCategoryEnum {
  business = 1,
  arithmetic = 2,
  admin = 3,
  my = 4,
  manages = 5,
  timetable = 6
}

export const enum WEEK {
  星期一 = 1,
  星期二 = 2,
  星期三 = 3,
  星期四 = 4,
  星期五 = 5,
  星期六 = 6,
  星期日 = 7,
}

export const enum QuestionTypeEnum {
  单选题 = 1,
  多选题 = 2,
  判断题 = 3,
}

export const enum AnswerCardTypeEnum {
  作业 = 1,
  考试 = 2,
}


export const enum ExaminerStatusEnum {
  删了 = 0, //  // NO_NEED_PROCESSING
  等待处理 = 1, // // WAIT_FOR_PROCESSING
  处理中 = 2,  //  // STARTING_PROCESSING
  处理错误 = 3,     //       // PROCESSING_ERROR
  完成 = 9,   // // PROCESSING_COMPLETE
}

export const enum PrintStatusEnum {
  待处理 = 1,
  完成打印 = 2,
  待取件 = 4,
  已取件 = 5
}

export function Enums(e?: any): Array<EnumValue> {
  return Object.keys(e).reduce((sum, value) => {
    if (parseInt(value, 10) >= 0) {
      sum.push({name: e[value], value});
    }
    return sum;
  }, new Array<EnumValue>());
}
