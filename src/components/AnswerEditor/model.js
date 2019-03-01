import Model from 'dva-model';
import {AnswerEditor as namespace} from '../../utils/namespace';
import QrCode from './QrCode';
import version from './version';
import {PAGE_SIZE} from "./const";
import {mm2px} from "./helper";
import * as ElementObject from './ElementObject';
import {QuestionTypeEnum} from "../../utils/Enum";


function calcColWidth(pageWidth, padding, colCount, colSpan) {
  return Math.floor((pageWidth - padding[1] - padding[3] - (colCount - 1) * colSpan) / colCount);
}

function createFile(state, action) {
  try {
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

    ElementObject.clear();

    const file = ElementObject.create({
      version,
      name: '新建文件',
      id: null,
      print: {
        dpi,
        type,
        width,
        height,
        w: mm2px(width),
        h: mm2px(height) - 1,
        direction,
        pageCount,
        padding,
        colCount,
        colSpan,
      },
      pages: []
    });

    const colWidth = calcColWidth(file.print.w, padding, colCount, colSpan);
    file.print.colWidth = colWidth;

    for (let i = 0; i < pageCount; i++) {
      const page = ElementObject.create({
        width: file.print.w,
        height: file.print.h,
        colCount,
        colSpan,
        colWidth,
        padding: file.print.padding,
        index: i,
        columns: [],
        // elements: [],
      });

      for (let j = 0; j < colCount; j++) {
        const col = ElementObject.create({
          width: colWidth,
          height: file.print.h,
          x: j * (colWidth + colSpan),
          y: 0,
          elements: [],
          index: j,
          path: [i, j],
          colSpan,
        });
        page.columns.push(col);
      }
      file.pages.push(page);
    }

    const firstPage = file.pages[0];
    const firstCol = firstPage.columns[0];

    firstCol.elements.push(ElementObject.create({type: 'page-title', title}));

    firstCol.elements.push(ElementObject.create({
      type: 'student-info',
      length: 8,
      code: new Date().getFullYear().toString(),
      y: 80
    }));

    if (choiceCount) {
      const ys = choiceCount % 5;
      let gs = Math.ceil(choiceCount / 5) + (ys === 0 ? 1 : 0);
      const cqw = 114 + 20;
      const cqh = 92 + 10;
      let i = 0;

      function createChoiceQuestion(count) {
        return ElementObject.create({
          type: 'choice-question',
          x: 250 + (i % 3) * cqw,
          y: 95 + Math.floor(i / 3) * cqh,
          startNumber: i * 5 + 1,
          count,
          optionCount: 4,
          questionType: QuestionTypeEnum.单选题
        });
      }

      for (; i < gs - 1; i++) {
        firstCol.elements.push(createChoiceQuestion(5));
      }
      if (ys) {
        firstCol.elements.push(createChoiceQuestion(ys));
      }
    }

    if (completionCount) {
      const cs = (choiceCount || 0) + 1;
      const cys = 312;
      const ch = 71 + 10;
      for (let i = 0; i < completionCount; i++) {
        firstCol.elements.push(ElementObject.create({
          type: 'completion-question',
          y: cys + ch * i,
          number: cs + i,
          count: 3,
        }));
      }
    }

    if (answerCount) {
      const as = ((choiceCount + completionCount) || 0) + 1;
      const ays = 717;
      const ah = 284;
      for (let i = 0; i < answerCount; i++) {
        firstCol.elements.push(ElementObject.create({
          type: 'answer-question',
          y: ays + i * ah,
          number: as + i,
        }));
      }
    }


    return {
      ...state, file
    };
  } catch (e) {
    console.error(e);
    return {...state};
  }

}

function addPage(state) {
  const {file} = state;
  const {print: {w, h, colCount, colSpan, colWidth, padding}, pages} = file;
  const page = ElementObject.create({
    width: w,
    height: h,
    colCount: colCount,
    colSpan: colSpan,
    colWidth: colWidth,
    padding: padding,
    columns: [],
    index: pages.length,
  });
  for (let j = 0; j < colCount; j++) {
    const col = ElementObject.create({
      width: colWidth,
      height: h,
      x: j * (colWidth + colSpan),
      y: 0,
      elements: [],
      index: j,
      path: [page.index, j]
    });
    page.columns.push(col);
  }
  file.pages.push(page);
  return {...state, file: ElementObject.create(file)};
}

function findActivePage(state) {
  const {file, activePageKey} = state;
  if (activePageKey && file && file.pages && file.pages.length) {
    return file.pages.find(page => page.key === activePageKey);
  }
}

function findActiveColumn(state) {
  const page = findActivePage(state);
  const {activeColumnKey} = state;
  if (page && page.columns && page.columns.length && activeColumnKey) {
    return page.columns.find(col => col.key === activeColumnKey);
  }
}

function findActiveElement(state) {
  const column = findActiveColumn(state);
  const {activeElementKey} = state;
  if (activeElementKey && column && column.elements && column.elements.length) {
    return column.elements.find(ele => ele.key === activeElementKey);
  }
}

function addColumn(state) {
  const {file} = state;
  const page = findActivePage(state);
  if (page) {
    const {print: {h, colSpan, colWidth}} = file;
    const j = page.columns.length;
    const col = ElementObject.create({
      width: colWidth,
      height: h,
      x: j * (colWidth + colSpan),
      y: 0,
      colSpan,
      elements: [],
      index: j,
      path: [page.index, j]
    });
    page.columns.push(col);
  }
  return {...state, file: ElementObject.create(file)};
}

function newFile() {
  ElementObject.clear();
  return {};
}

function removeActiveElement(state) {
  const {activeElementKey} = state;
  const obj = ElementObject.remove(activeElementKey);
  const col = findActiveColumn(state);
  if (obj && col) {
    const index = col.elements.findIndex(ele => obj.key === ele.key);
    if (index >= 0) {
      col.elements.splice(index, 1);
      return {...state, activeElementKey: null, file: ElementObject.create(autoQuestionNumber(state.file))};
    }
  }
  return {...state};
}

function autoQuestionNumber(file) {
  let number = 1;
  file.pages.forEach(page => {
    page.columns.forEach(col => {
      col.elements.forEach(ele => {
        switch (ele.type) {
          case 'choice-question':
            ele.startNumber = number;
            number += ele.count;
            break;
          case 'completion-question':
          case 'answer-question':
            ele.number = number++;
            break;
          default:
            break;
        }
      })
    })
  });
  return file;
}

function insertQuestion(state, question) {
  const col = findActiveColumn(state);
  if (col) {
    if (col.elements && col.elements.length && state.activeElementKey) {
      const activeElementIndex = col.elements.findIndex(ele => ele.key === state.activeElementKey);
      if (activeElementIndex >= 0) {
        const afterElements = col.elements.splice(activeElementIndex + 1, col.elements.length - activeElementIndex + 1);
        col.elements = col.elements.concat([question]).concat(afterElements);
      } else {
        col.elements.push(question);
      }
    } else {
      col.elements.push(question);
    }

    return {...state, file: ElementObject.create(autoQuestionNumber(state.file))}
  }
  return state;
}

function addChoiceQuestion(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'choice-question',
    x: 0,
    count: 5,
    optionCount: 4
  }));
}

function addCompletionQuestion(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'completion-question',
    number: 1,
    count: 3
  }));
}

function addAnswerQuestion(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'answer-question',
    number: 1,
  }));
}

function addTitleBox(state) {
  const page = findActivePage(state);
  if (page && page.columns && page.columns.length) {
    const firstCol = page.columns[0];
    firstCol.elements.unshift(
      ElementObject.create({type: 'page-title', title: ''})
    );
    return {...state, file: ElementObject.create(state.file)};
  }
  return state;
}

function setElementAttribute(state, action) {
  const {key, value} = action.payload;
  const ele = findActiveElement(state);
  if (ele) {
    ele[key] = value;
    const {file, attributePanelConfig} = state;
    if (attributePanelConfig[key]) {
      attributePanelConfig[key].value = value;
    }
    return {...state, file: ElementObject.create(file), attributePanelConfig: {...attributePanelConfig}};
  }
  return state;
}

function* buildQrCode(action, saga) {
  const qrCode = yield QrCode(action.payload.str);
  yield saga.put({type: 'buildQrCodeSuccess', payload: {qrCode}});
}

function buildQrCodeSuccess(state, action) {
  const {file} = state;
  file.qrCode = action.payload.qrCode;
  return {...state, file: ElementObject.create(file)}
}


export default Model(
  {
    namespace,

    state: {},

    effects: {
      buildQrCode
    },
    reducers: {
      createFile,
      newFile,
      addPage,
      removeActiveElement,
      addColumn,
      addTitleBox,
      buildQrCodeSuccess,
      addChoiceQuestion,
      addCompletionQuestion,
      addAnswerQuestion,
      setElementAttribute,
      autoQuestionNumber(state) {
        return {...state, file: ElementObject.create(autoQuestionNumber(state.file))};
      }
    }
  },
  {}
);

