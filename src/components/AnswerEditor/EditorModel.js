import Model from 'dva-model';
import {message} from 'antd';
import {AnswerEditor as namespace,} from '../../utils/namespace';
import QrCode from './QrCode';
import ver from './version';
import {PAGE_SIZE} from "./const";
import {mm2px, text2html} from "./helper";
import * as ElementObject from './ElementObject';
import {QuestionTypeEnum} from "../../utils/Enum";
import {list, create, item, remove, modify} from '../../services/examiner/answer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf/dist/jspdf.debug.js';
import {pipes, pipe} from "../../utils/pipe";
import router from 'umi/router';

window.html2canvas = html2canvas;


function saveToPDF(state) {

  const doc = new jsPDF('p', 'mm', 'a4');
  console.log(doc);

  const {file} = state;

  pipes(
    page => doc.addHTML(document.getElementById(page.key))
  ).then(
    () => doc.save('a4.pdf')
  );

}


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
        },
        info = {}
      }
    } = action;

    const {print: {width, height}, direction} = PAGE_SIZE[type];

    ElementObject.clear();

    const file = ElementObject.create({
      gradeId: info.grade[0],
      unitId: info.grade[1],
      type: info.type,
      subjectId: info.subject,
      ver,
      name: title.replace(/\n/g, ''),
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
          // x: j * (colWidth + colSpan),
          // y: 0,
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

    firstCol.elements.push(ElementObject.create({type: 'page-title', title: text2html(title)}));

    firstCol.elements.push(ElementObject.create({
      type: 'student-info',
      length: 8,
      code: new Date().getFullYear().toString(),
      // y: 80
    }));

    if (choiceCount) {
      const ys = choiceCount % 5;
      let gs = Math.ceil(choiceCount / 5) + (ys === 0 ? 1 : 0);
      // const cqw = 114 + 20;
      // const cqh = 92 + 10;
      let i = 0;

      function createChoiceQuestion(count) {
        return ElementObject.create({
          type: 'choice-question',
          // x: 250 + (i % 3) * cqw,
          // y: 95 + Math.floor(i / 3) * cqh,
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
      // const cys = 312;
      // const ch = 71 + 10;
      for (let i = 0; i < completionCount; i++) {
        firstCol.elements.push(ElementObject.create({
          type: 'completion-question',
          // y: cys + ch * i,
          number: cs + i,
          count: 3,
        }));
      }
    }

    if (answerCount) {
      const as = ((choiceCount + completionCount) || 0) + 1;
      // const ays = 717;
      // const ah = 284;
      for (let i = 0; i < answerCount; i++) {
        firstCol.elements.push(ElementObject.create({
          type: 'answer-question',
          // y: ays + i * ah,
          number: as + i,
        }));
      }
    }


    return {
      ...state, file, activePageKey: firstPage.key, activeColumnKey: firstCol.key,
    };
  } catch (e) {
    console.error(e);
    return {...state};
  }

}

function createPage(state) {
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
      // x: j * (colWidth + colSpan),
      // y: 0,
      elements: [],
      index: j,
      path: [page.index, j]
    });
    page.columns.push(col);
  }
  return page;
}

function addPage(state) {
  const {file} = state;
  const page = createPage(state);
  file.pages.push(page);
  return {...state, file: ElementObject.create(file)};
}

function findActivePage(state) {
  const {file, activePageKey} = state;
  if (activePageKey && file && file.pages && file.pages.length) {
    return file.pages.find(page => page.key === activePageKey);
  }
}

function findIndexActivePage(state) {
  const {file, activePageKey} = state;
  if (activePageKey && file && file.pages && file.pages.length) {
    return file.pages.findIndex(page => page.key === activePageKey);
  }
}

function findActiveColumn(state) {
  const page = findActivePage(state);
  const {activeColumnKey} = state;
  if (page && page.columns && page.columns.length && activeColumnKey) {
    return page.columns.find(col => col.key === activeColumnKey);
  }
}

function findIndexActiveColumn(state) {
  const page = findActivePage(state);
  const {activeColumnKey} = state;
  if (page && page.columns && page.columns.length && activeColumnKey) {
    return page.columns.findIndex(col => col.key === activeColumnKey);
  }
}


function findActiveElement(state) {
  const column = findActiveColumn(state);
  const {activeElementKey} = state;
  if (activeElementKey && column && column.elements && column.elements.length) {
    return column.elements.find(ele => ele.key === activeElementKey);
  }
}

function findIndexActiveElement(state) {
  const column = findActiveColumn(state);
  const {activeElementKey} = state;
  if (activeElementKey && column && column.elements && column.elements.length) {
    return column.elements.findIndex(ele => ele.key === activeElementKey);
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

function removeActiveColumn(state) {
  const {activeColumnKey} = state;
  const obj = ElementObject.remove(activeColumnKey);
  const page = findActivePage(state);
  if (obj && page) {
    const index = page.columns.findIndex(col => obj.key === col.key);
    if (index >= 0) {
      page.columns.splice(index, 1);
      return {...state, activeColumnKey: null, file: ElementObject.create(autoQuestionNumber(state.file))};
    }
  }
  return state;
}

function newFile() {
  ElementObject.clear();
  return {};
}

function removeActiveElement(state) {
  const {activeElementKey} = state;
  const col = findActiveColumn(state);
  if (col) {
    const index = col.elements.findIndex(ele => activeElementKey === ele.key);
    if (index >= 0) {
      ElementObject.remove(activeElementKey);
      col.elements.splice(index, 1);
      return {...state, activeElementKey: null, file: ElementObject.create(autoQuestionNumber(state.file))};
    }
  }
  return state;
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
    if (!(firstCol.elements[0] && firstCol.elements[0].type === 'page-title')) {
      firstCol.elements.unshift(
        ElementObject.create({type: 'page-title', title: ''})
      );
      return {...state, file: ElementObject.create(state.file)};
    } else {
      message.warning('已经有标题了');
    }
  }
  return state;
}

function addStudentInfoBox(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'student-info',
    length: 8,
  }));
}

function setElementAttribute(state, action) {
  const {key, value} = action.payload;
  const pageIndex = findIndexActivePage(state);
  const columnIndex = findIndexActiveColumn(state);
  const elementIndex = findIndexActiveElement(state);
  const ele = findActiveElement(state);
  if (ele && pageIndex >= 0 && columnIndex >= 0 && elementIndex >= 0) {
    const {file, attributePanelConfig} = state;
    file.pages[pageIndex].columns[columnIndex].elements[elementIndex] = {
      ...ele,
      [key]: value,
    };
    console.log(ele, key, value);
    if (attributePanelConfig[key]) {
      attributePanelConfig[key].value = value;
    }
    return {
      ...state,
      file: ElementObject.create(calculationTotalScore(file)),
      attributePanelConfig: {...attributePanelConfig}
    };
  }
  return state;
}

function calculationTotalScore(file) {
  file.score = file.pages.reduce((sum, page) => {
    return page.columns.reduce((sum, col) => {
      return col.elements.reduce((sum, ele) => {
        switch (ele.type) {
          case 'choice-question':
            return sum + ele.count * ele.score;
          case 'completion-question':
          case 'answer-question':
            return sum + ele.score;
          default:
            return sum;
        }
      }, sum);
    }, sum)
  }, 0);
  return file;
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

function createPosition(state) {
  const {file} = state;
  calculationTotalScore(file);
  const pages = file.pages.map(page => {
    const pageElement = document.getElementById(page.key);
    const {x, y} = pageElement.getBoundingClientRect();
    const qrCode = toRole(pageElement.querySelector('img[data-type="qr-code"]'), x, y);
    qrCode.width = 72;
    qrCode.height = 72;
    qrCode.x += 14;
    qrCode.y += 14;
    const elements = [
      qrCode
    ];

    const points = pageElement.querySelectorAll('div[data-type="point"]');

    for (let point of points) {
      elements.push(toRole(point, x, y));
    }

    page.columns.forEach(col => {
      const colElement = document.getElementById(col.key);
      const children = colElement.querySelectorAll(`[role="column"] > [role="box"]`);
      for (let box of children) {
        if (box.dataset.type === 'choice-question') {
          for (let choiceEle of box.children) {
            const roleChoice = toRole(choiceEle, x, y);
            const subList = choiceEle.querySelectorAll('[role="box"]');
            if (subList.length) {
              roleChoice.children = [];
              for (let subBox of subList) {
                roleChoice.children.push(toRole(subBox, x, y));
              }
            }
            roleChoice.number = parseInt(roleChoice.number, 10);
            elements.push(roleChoice);
          }
        } else {
          const roleBox = toRole(box, x, y);
          const subList = box.querySelectorAll('[role="box"]');
          if (subList.length) {
            roleBox.children = [];
            for (let subBox of subList) {
              roleBox.children.push(toRole(subBox, x, y));
            }
            if (roleBox.type === 'completion-question') {
              const items = [];
              const c = [];
              roleBox.children.forEach(it => {
                if (it.type === 'sub-completion-question') {
                  items.push(it);
                } else {
                  c.push(it);
                }
              });
              roleBox.children = c;
              roleBox.items = items;
            }
          }
          if (roleBox.number) {
            roleBox.number = parseInt(roleBox.number, 10);
          }
          elements.push(roleBox);
        }
      }
    });
    return elements;
  });
  return {
    ver,
    score: file.score,
    print: {
      ...file.print,
      width: file.print.w,
      height: file.print.h + 1,
      w: file.print.width,
      h: file.print.height,
    },
    pages
  };
}


function toRole(ele, ox = 0, oy = 0) {
  const {x, y, width, height} = ele.getBoundingClientRect();
  const ret = {x: x - ox, y: y - oy, width, height, ...ele.dataset};
  delete ret.checked;
  return ret;
}

function checkContentOverflow(state) {
  console.log('checkContentOverflow');
  const {file} = state;
  const {pages} = file;
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    for (let columnIndex = 0; columnIndex < page.columns.length; columnIndex++) {
      const column = page.columns[columnIndex];
      if (column.elements.length > 1) {
        const lastElement = column.elements[column.elements.length - 1];
        const lastNode = document.getElementById(lastElement.key);
        const colNode = document.getElementById(column.key);
        if (colNode && lastNode) {

          const lastOffset = lastNode.getBoundingClientRect();
          const colOffset = colNode.getBoundingClientRect();

          // 列中最后一个元素的底边如果已经超过了列底边,
          // 将此元素移动到下一列的开头， 如果没有下一列，则一添加列，
          // 如果页面列数已满， 则应该先添加页面
          if ((lastOffset.y + lastOffset.height) - (colOffset.y + colOffset.height) > 0) {

            let nextCol;
            // 判断是否存在下一列
            if (page.columns[columnIndex + 1]) {
              nextCol = page.columns[columnIndex + 1];
            }
            // 如果还可以添加列
            else if (page.columns.length < page.colCount) {
              nextCol = ElementObject.create({
                elements: [],
                index: page.columns.length
              });
              page.columns.push(nextCol);
            }
            // 如果还有下一页
            else if (pages[pageIndex + 1]) {
              const nextPage = pages[pageIndex + 1];
              nextCol = nextPage.columns[0];
            }
            // 只能添加页了
            else {
              const nextPage = createPage(state);
              pages.push(nextPage);
              nextCol = nextPage.columns[0];
            }

            column.elements.splice(column.elements.length - 1, 1);
            if (nextCol.elements[0] && nextCol.elements[0].type === 'page-title') {
              const elements = nextCol.elements.splice(0, 1);
              nextCol.elements = elements.concat(lastElement).concat(nextCol.elements);
            } else {
              nextCol.elements.unshift(lastElement);
            }
            console.log(`自动将${pageIndex}-${columnIndex}的最后一个元素${lastElement.key}插入到下一列中`)
            return true
          }
        }
      }
      let firstElement = column.elements[0];
      // 如果列的第一个元素不是标题，且不是第一页第一列
      if (firstElement && firstElement.type !== 'page-title' && pageIndex + columnIndex > 0) {
        // 获取元素的DOM
        const firstNode = document.getElementById(firstElement.key);
        if (firstNode) {
          let prevCol;
          //
          if (columnIndex > 0) {
            prevCol = page.columns[columnIndex - 1];
          } else if (pageIndex > 0) {
            const prevPage = pages[pageIndex - 1];
            prevCol = prevPage.columns[prevPage.columns.length - 1];
          }
          if (prevCol) {
            const firstEleOffset = firstNode.getBoundingClientRect();
            const prevColNode = document.getElementById(prevCol.key);
            if (prevColNode) {
              const prevColOffset = prevColNode.getBoundingClientRect();
              let height = prevColOffset.height - 10;
              if (prevCol.elements.length) {
                const prevColLastEle = prevCol.elements[prevCol.elements.length - 1];
                const prevColLastNode = document.getElementById(prevColLastEle.key);
                const prevColLastOffset = prevColLastNode.getBoundingClientRect();
                height = prevColOffset.y + prevColOffset.height - 10 - (prevColLastOffset.y + prevColLastOffset.height);
              }
              if (height - firstEleOffset.height > 0) {
                console.log(
                  '上移',
                  height,
                  firstEleOffset.height,
                  height - firstEleOffset.height
                );
                prevCol.elements.push(column.elements.shift());
                const pageHasElementCount = page.columns.reduce((sum, col) => (sum + col.elements.length), 0);
                if (!pageHasElementCount) {
                  pages.splice(pageIndex, 1);
                }
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function buildElementOffset(state) {
  const {file} = state;
  file.pages.forEach(page => {
    page.columns.forEach(column => {
      column.elements.forEach(element => {
        element.offset = offset(element.key);
      });
      column.offset = offset(column.key);
    });
    page.offset = offset(page.key);
  });
  file.offset = offset(file.key);
  return {...state, file: ElementObject.create(file)};
}

function offset(id) {
  const node = document.getElementById(id);
  const {x, y, width, height} = node ? node.getBoundingClientRect() : {};
  return {x, y, width, height};
}


export default Model(
  {
    namespace,

    state: {},

    subscriptions: {
      setup({dispatch, history}) {
        history.listen(({pathname, query}) => {
          if (pathname === namespace + '/editor') {
            if (query.id) {
              dispatch({
                type: 'item',
                payload: {...query},
              });
            }
          }
        });
      },
    },

    effects: {
      buildQrCode,
      * print() {
        window.print();
      },
      * save(action, saga) {
        const state = yield saga.select(state => state[namespace]);
        const data = createPosition(state);
        const file = JSON.parse(JSON.stringify(state.file || {}));
        delete file.qrCode;
        if (!file.id) {
          delete file.id;
        }
        file.title = file.name;
        file.pages = JSON.stringify(file.pages || []);
        file.print = JSON.stringify(file.print || {});
        file.data = JSON.stringify(data || {});
        yield saga.put({
          type: file.id ? 'modify' : 'create',
          payload: file,
          resolve: action.resolve,
          reject: action.reject
        });
      },
      saveToPDF,

    },
    reducers: {
      buildElementOffset,
      createFile,
      newFile,
      addPage,
      removeActiveElement,
      removeActiveColumn,
      addColumn,
      addTitleBox,
      buildQrCodeSuccess,
      addChoiceQuestion,
      addCompletionQuestion,
      addAnswerQuestion,
      addStudentInfoBox,
      setElementAttribute,
      autoQuestionNumber(state) {
        return {...state, file: ElementObject.create(autoQuestionNumber(state.file))};
      },

      createSuccess(state, action) {
        const {result} = action;
        const {list = []} = state;
        state.file = calculationTotalScore(result);
        return {...state, list: [result, ...list], loading: false};
      },

      checkContentOverflow(state) {
        if (checkContentOverflow(state)) {
          return {...state, file: ElementObject.create(state.file)}
        }
        return state;
      },

      // save(state) {
      //   const ret = createPosition(state);
      //   console.log(JSON.stringify(ret));
      //   return state;
      // },

      itemSuccess(state, action) {
        const {result = {}} = action;
        const firstPage = result && result.pages && result.pages[0];
        const activePageKey = firstPage && firstPage.key;
        const firstCol = firstPage && firstPage.columns && firstPage.columns[0];
        const activeColumnKey = firstCol && firstCol.key;
        calculationTotalScore(result);

        return {...state, file: result, activePageKey, activeColumnKey, loading: false};
      }

    }
  },
  {
    list, create, item, remove, modify
  }
);

