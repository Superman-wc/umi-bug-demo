import uuid from 'uuid/v4';
import version from './version';
import {PAGE_SIZE} from "./const";
import {mm2px} from "./helper";

function calcColWidth(pageWidth, padding, colCount, colSpan) {
  return Math.floor((pageWidth - padding[1] - padding[3] - (colCount - 1) * colSpan) / colCount);
}

function createFile(state, action) {
  const {
    payload: {
      print: {
        dpi = 96,
        type = "A4",
        padding = [60, 45, 60, 45],
        pageCount = 1,
        colCount = 1,
        colSpan = 30,
      },
      content: {
        title = '',
        choiceCount = 30,
        completionCount = 5,
        answerCount = 1,
      }
    }
  } = action;

  const {print: {width, height}, direction} = PAGE_SIZE[type];


  const file = {
    version,
    name: '新建文件',
    id: null,
    print: {
      dpi,
      type,
      width,
      height,
      w: mm2px(width),
      h: mm2px(height),
      direction,
      pageCount,
      padding,
      colCount,
      colSpan,
    },
    pages: []
  };

  const colWidth = calcColWidth(file.print.w, padding, colCount, colSpan);

  for (let i = 0; i < pageCount; i++) {
    const page = createPage({
      w: file.print.w,
      h: file.print.h,
      index: i,
      colCount,
      colSpan,
      colWidth
    });

    for (let j = 0; j < colCount; j++) {

    }

    file.pages.push(page);
  }


  return {
    ...state, file
  };
}

function createPage(opt) {
  const page = {
    ...opt,
    key: uuid(),
    cols: []
  };
  return page;
}


export default {
  state: {},
  reducers: {
    createFile,
  }
}


const a = {
  "title": "这是测试用的",
  "choiceCount": 30,
  "completionCount": 5,
  "answerCount": 1,
  "dpi": 96,
  "type": "A4",
  "padding": [60, 45, 60, 45],
  "colsCount": 1,
  "colSpan": 30,
  "version": "1.0",
  "pages": [{
    "key": "1ca4d955-1b17-49b5-ab3d-6a61aa0430f6",
    "type": "A4",
    "padding": [60, 45, 60, 45],
    "colSpan": 30,
    "colsCount": 1,
    "width": 794,
    "height": 1123,
    "cols": [{
      "key": "3258ffa6-69fd-4f44-b514-deae259f9def",
      "width": 704,
      "elements": [{
        "key": "654fef71-e04f-461f-bcc1-26ea094ffd4c",
        "type": "page-title",
        "value": "这是测试用的"
      }, {
        "key": "17fbd442-c965-4020-9577-b2bc335ae945",
        "type": "student-info",
        "length": 8,
        "code": "2019",
        "y": 80
      }, {
        "key": "50744905-5a1e-4163-a6c1-1e62da365e5e",
        "type": "choice-question",
        "x": 250,
        "y": 80,
        "startNumber": 1,
        "count": 5,
        "optionCount": 4
      }, {
        "key": "b43dca2f-6edf-4a8c-8cf8-3aa10a04fa45",
        "type": "choice-question",
        "x": 384,
        "y": 80,
        "startNumber": 6,
        "count": 5,
        "optionCount": 4
      }, {
        "key": "69df01f3-2b0a-41ea-a528-e3a03c2056de",
        "type": "choice-question",
        "x": 518,
        "y": 80,
        "startNumber": 11,
        "count": 5,
        "optionCount": 4
      }, {
        "key": "10107cbc-9967-46bf-b7ee-6ed1091adcc5",
        "type": "choice-question",
        "x": 250,
        "y": 182,
        "startNumber": 16,
        "count": 5,
        "optionCount": 4
      }, {
        "key": "960c9536-78de-40d8-98eb-df20a880819a",
        "type": "choice-question",
        "x": 384,
        "y": 182,
        "startNumber": 21,
        "count": 5,
        "optionCount": 4
      }, {
        "key": "ccb942bb-864a-41e0-9cbb-f43c6cd4fc07",
        "type": "choice-question",
        "x": 518,
        "y": 182,
        "startNumber": 26,
        "count": 5,
        "optionCount": 4
      }, {
        "key": "3386e52c-e2a7-47fa-bd85-d9b62adeb850",
        "type": "completion-question",
        "y": 312,
        "startNumber": 31,
        "rowCount": 5,
        "colCount": 3
      }, {
        "key": "c07c77d5-1236-4b57-88ad-0136b3530b73",
        "type": "answer-question",
        "y": 534,
        "number": 36,
        "score": 10
      }],
      "colSpan": 30
    }]
  }]
}
