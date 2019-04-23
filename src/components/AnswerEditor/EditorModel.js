import Model from 'dva-model';
import {message} from 'antd';
import {AnswerEditor as namespace,} from '../../utils/namespace';
import QrCode from './QrCode';
import ver from './version';
import {PAGE_SIZE} from "./const";
import {html2text, mm2px, text2html} from "./helper";
import * as ElementObject from './ElementObject';
import {QuestionTypeEnum} from "../../utils/Enum";
import {list, create, item, remove, modify} from '../../services/examiner/answer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf/dist/jspdf.debug.js';
import {pipes, pipe} from "../../utils/pipe";
import cache from './cache';


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

/**
 * 计算列宽度，（页面宽度 - 页面左右边距 - (列数-1)*列边距）/ 列数
 * @param pageWidth 页面宽度
 * @param padding   页面边距
 * @param colCount  列数
 * @param colSpan   列边距
 * @returns {number}
 */
function calcColWidth(pageWidth, padding, colCount, colSpan) {
  return Math.floor((pageWidth - padding[1] - padding[3] - (colCount - 1) * colSpan) / colCount);
}

/**
 * 创建文件
 * @param state
 * @param action
 * @returns {*}
 */
function createFile(state, action) {
  try {
    const {
      payload: {
        print: {
          dpi = 96,
          type = "A4",
          padding = [80, 60, 80, 60],
          pageCount = 1,
          colCount = 1,
          colSpan = 30,
        },
        content: {
          title = '',
          choiceCount = 30,
          completionCount = 5,
          answerCount = 1,
          englishTranslation = '',  // 英语翻译专用
          // type='common', || 'englishTranslation'
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
      code: (info.schoolYear || new Date().getFullYear()).toString(),
    }));

    // 英语翻译专用
    if (action.payload.content.type === 'englishTranslation') {
      const content = (englishTranslation || '').split(/\n/g);
      const secondCol = firstPage.columns[1];
      for (let i = 0; i < content.length ;i += 2) {
        if(i<32) {
          firstCol.elements.push(ElementObject.create({
            type: 'english-translation-question',
            number: Math.floor(i / 2) + 1,
            stem: content[i],
            answer: content[i + 1],
            score: 1,
          }));
        }else{
          secondCol.elements.push(ElementObject.create({
            type: 'english-translation-question',
            number: Math.floor(i / 2) + 1,
            stem: content[i],
            answer: content[i + 1],
            score: 1,
          }));
        }
      }
    }
    // 通用答题卡内容
    else {
      if (choiceCount) {
        const ys = choiceCount % 5;
        let gs = Math.ceil(choiceCount / 5) + (ys === 0 ? 1 : 0);
        let i = 0;

        const createChoiceQuestion = (count) => {
          return ElementObject.create({
            type: 'choice-question',
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
        for (let i = 0; i < completionCount; i++) {
          firstCol.elements.push(ElementObject.create({
            type: 'completion-question',
            number: cs + i,
            count: 3,
          }));
        }
      }

      if (answerCount) {
        const as = ((choiceCount + completionCount) || 0) + 1;
        for (let i = 0; i < answerCount; i++) {
          firstCol.elements.push(ElementObject.create({
            type: 'answer-question',
            number: as + i,
          }));
        }
      }
    }
    return {
      ...state, file, activePageKey: firstPage.key, activeColumnKey: firstCol.key,
      createFilePayload: action.payload,
    };
  } catch (e) {
    console.error(e);
    return {...state, createFilePayload: action.payload,};
  }

}

/**
 * 创建页面
 * @param state
 */
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

/**
 * 添加页面
 * @param state
 * @returns {{file}}
 */
function addPage(state) {
  const {file} = state;
  const page = createPage(state);
  file.pages.push(page);
  return {...state, file: ElementObject.create(file)};
}

/**
 * 查找页面
 * @param file
 * @param pageKey
 * @returns {*}
 */
function findPage(file, pageKey) {
  if (pageKey && file && file.pages && file.pages.length) {
    return file.pages.find(page => page.key === pageKey);
  }
}

/**
 * 查找激活的页面
 * @param state
 * @returns {*}
 */
function findActivePage(state) {
  const {file, activePageKey} = state;
  return findPage(file, activePageKey);
}

/**
 * 查找页面索引
 * @param file
 * @param pageKey
 * @returns {*}
 */
function findIndexPage(file, pageKey) {
  if (pageKey && file && file.pages && file.pages.length) {
    return file.pages.findIndex(page => page.key === pageKey);
  }
}

/**
 * 查找激活页面的索引
 * @param state
 * @returns {*}
 */
function findIndexActivePage(state) {
  const {file, activePageKey} = state;
  return findIndexPage(file, activePageKey);
}

function findColumn(file, columnKey, pageKey) {
  const page = findPage(file, pageKey);
  if (page && page.columns && page.columns.length && columnKey) {
    return page.columns.find(col => col.key === columnKey);
  }
}

/**
 * 查找激活的列
 * @param state
 * @returns {*}
 */
function findActiveColumn(state) {
  const {activeColumnKey, activePageKey, file} = state;
  return findColumn(file, activeColumnKey, activePageKey);
}

/**
 * 查找激活的列的索引
 * @param state
 * @returns {number}
 */
function findIndexActiveColumn(state) {
  const page = findActivePage(state);
  const {activeColumnKey} = state;
  if (page && page.columns && page.columns.length && activeColumnKey) {
    return page.columns.findIndex(col => col.key === activeColumnKey);
  }
}

/**
 * 查找激活的元素
 * @param state
 * @returns {*}
 */
function findActiveElement(state) {
  const column = findActiveColumn(state);
  const {activeElementKey} = state;
  if (activeElementKey && column && column.elements && column.elements.length) {
    return column.elements.find(ele => ele.key === activeElementKey);
  }
}

/**
 * 查找激活的元素的索引
 * @param state
 * @returns {*}
 */
function findIndexActiveElement(state) {
  const column = findActiveColumn(state);
  const {activeElementKey} = state;
  if (activeElementKey && column && column.elements && column.elements.length) {
    return column.elements.findIndex(ele => ele.key === activeElementKey);
  }
}

/**
 * 添加列
 * @param state
 * @returns {{file}}
 */
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

/**
 * 删除激活的列
 * @param state
 * @returns {*}
 */
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

/**
 * 新建文件
 * @param state
 * @returns {{file: null, createFilePayload: *}}
 */
function newFile(state) {
  ElementObject.clear();
  const createFilePayload = cache('createFilePayload');
  console.log('newFile createFilePayload=', createFilePayload);
  return {...state, file: null, createFilePayload};
}

/**
 * 删除激活的元素
 * @param state
 * @returns {*}
 */
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

/**
 * 自动题号
 * @param file
 * @returns {*}
 */
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

/**
 * 插入题目
 * @param state
 * @param question
 * @returns {*}
 */
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

/**
 * 添加选择题
 * @param state
 * @returns {{file}}
 */
function addChoiceQuestion(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'choice-question',
    x: 0,
    count: 5,
    optionCount: 4
  }));
}

/**
 * 添加填空题
 * @param state
 * @returns {{file}}
 */
function addCompletionQuestion(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'completion-question',
    number: 1,
    count: 3
  }));
}

/**
 * 添加解答题
 * @param state
 * @returns {{file}}
 */
function addAnswerQuestion(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'answer-question',
    number: 1,
  }));
}

/**
 * 添加页面标题
 * @param state
 * @returns {*}
 */
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

/**
 * 添加学生信息框
 * @param state
 * @returns {{file}}
 */
function addStudentInfoBox(state) {
  return insertQuestion(state, ElementObject.create({
    type: 'student-info',
    length: 8,
  }));
}

/**
 * 设置元素属性
 * @param state
 * @param action
 * @returns {*}
 */
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

/**
 * 计算总分
 * @param file
 * @returns {*}
 */
function calculationTotalScore(file) {
  file.score = file.pages.reduce((sum, page) => {
    return page.columns.reduce((sum, col) => {
      return col.elements.reduce((sum, ele) => {
        switch (ele.type) {
          case 'choice-question':
            return sum + ele.count * (ele.score || 1);
          case 'completion-question':
          case 'answer-question':
            return sum + (ele.score || 1);
          default:
            return sum;
        }
      }, sum);
    }, sum)
  }, 0);
  return file;
}

/**
 * 生成二维码
 * @param action
 * @param saga
 * @returns {IterableIterator<*>}
 */
function* buildQrCode(action, saga) {
  const qrCode = yield QrCode(action.payload.str);
  yield saga.put({type: 'buildQrCodeSuccess', payload: {qrCode}});
}

/**
 * 生成二维码成功
 * @param state
 * @param action
 * @returns {{file}}
 */
function buildQrCodeSuccess(state, action) {
  const {file} = state;
  file.qrCode = action.payload.qrCode;
  return {...state, file: ElementObject.create(file)}
}

/**
 * 生成位置信息数据
 * @param state
 * @returns {{ver: number, score: *, print: {width: (number|*), height: *, w, h}, pages: *}}
 */
function createPosition(state) {
  const {file} = state;
  calculationTotalScore(file);
  const pages = file.pages.map(page => {
    const pageElement = document.getElementById(page.key);
    const {left, top} = pageElement.getBoundingClientRect();
    const qrCode = toRole(pageElement.querySelector('img[data-type="qr-code"]'), left, top);
    qrCode.width = 72;
    qrCode.height = 72;
    qrCode.x += 14;
    qrCode.y += 14;
    const elements = [
      qrCode
    ];

    const points = pageElement.querySelectorAll('div[data-type="point"]');

    for (let point of points) {
      elements.push(toRole(point, left, top));
    }

    page.columns.forEach(col => {
      const colElement = document.getElementById(col.key);
      const children = colElement.querySelectorAll(`[role="column"] > [role="box"]`);
      for (let box of children) {
        if (box.dataset.type === 'choice-question') {
          for (let choiceEle of box.children) {
            const roleChoice = toRole(choiceEle, left, top);
            const subList = choiceEle.querySelectorAll('[role="box"]');
            if (subList.length) {
              roleChoice.children = [];
              for (let subBox of subList) {
                roleChoice.children.push(toRole(subBox, left, top));
              }
            }
            roleChoice.number = parseInt(roleChoice.number, 10);
            elements.push(roleChoice);
          }
        } else {
          const roleBox = toRole(box, left, top);
          const subList = box.querySelectorAll('[role="box"]');
          if (subList.length) {
            roleBox.children = [];
            for (let subBox of subList) {
              roleBox.children.push(toRole(subBox, left, top));
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

/**
 * 转换成role信息
 * @param ele
 * @param ox
 * @param oy
 * @returns {{x: number, y: number, width, height, [p: string]: string | undefined}}
 */
function toRole(ele, ox = 0, oy = 0) {
  const {left, top, width, height} = ele.getBoundingClientRect();
  const ret = {x: left - ox, y: top - oy, width, height, ...ele.dataset};
  delete ret.checked;
  return ret;
}

/**
 * 执行检查内容溢出
 * @param state
 * @returns {boolean}
 */
function runCheckContentOverflow(state) {
  console.log('checkContentOverflow');
  const {file} = state;
  const {pages} = file || {};
  if (pages && pages.length) {
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
            if (lastOffset.bottom - colOffset.bottom > 10) {

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
              console.log(`自动将${pageIndex}-${columnIndex}的最后一个元素${lastElement.key}插入到下一列中`);
              const event = document.createEvent('HTMLEvents');
              event.initEvent('autoFocusContentEditableArea', true, true);
              document.dispatchEvent(event);
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
                  height = prevColOffset.bottom - prevColLastOffset.bottom - 10;
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
  }
  return false;
}

/**
 * 构建元素位置信息
 * @param state
 * @returns {{file}}
 */
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

window.debugShowData = (data) => {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }
  if (data.pages && data.pages.length) {
    const fileNode = document.querySelector('[role="file"]');
    const pageNodes = fileNode.querySelectorAll('[role="page"]');
    data.pages.forEach((pageElements, pageIndex) => {
      const pageNode = pageNodes[pageIndex];
      pageElements.forEach((ele) => {
        const {type, x, y, width, height} = ele;
        const node = document.createElement('div');
        node.style.width = width + 'px';
        node.style.height = height + 'px';
        node.style.top = y + 'px';
        node.style.left = x + 'px';
        node.style.position = 'absolute';
        node.style.background = 'rgba(255,0,0,.3)';
        pageNode.appendChild(node);
        // ele.style
      })
    });
  }
};

/**
 * DOM元素位置信息
 * @param id
 * @returns {{x, y, width, height}}
 */
function offset(id) {
  const node = document.getElementById(id);
  const {left, top, width, height} = node ? node.getBoundingClientRect() : {};
  return {x: left, y: top, width, height};
}

/**
 * 工作区缓存
 * @param state
 * @returns {string|{}}
 */
function cacheWorkspace(state) {
  const keys = ['file', 'gradeList', 'subjectList', 'classList', 'createFilePayload'];
  if (state) {
    keys.forEach(key => {
      if (state[key]) {
        cache(key, state[key]);
      }
    });
  } else {
    return keys.reduce((state, key) => {
      const data = cache(key);
      if (data) {
        state[key] = data;
      }
      return state;
    }, {});
  }
}

/**
 * 工作区缓存Reducers
 * @param reducers
 * @returns {[string , any]}
 */
function wrapperCacheWorkspace(reducers) {
  return Object.entries(reducers).reduce((map, [key, reducer]) => {
    map[key] = (state, action) => {
      const nextState = reducer(state, action);
      cacheWorkspace(nextState);
      return nextState;
    };
    return map;
  }, {});
}


export default Model(
  {
    namespace,

    state: cacheWorkspace(),

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
          if (pathname === '/examiner' || (pathname === namespace + '/marking')) {
            dispatch({
              type: 'list',
              payload: {...query}
            })
          }
        });
      },
    },

    effects: {
      buildQrCode,
      * print() {
        // 打印前要将内容区域移动到左顶点
        // document.documentElement.className = styles['print'];
        // window.scrollTo(0, 0);
        // document.body.scrollTo(0, 0);
        // document.getElementById('root').scrollTo(0, 0);
        window.print();
        // document.documentElement.className = ''
      },
      * save(action, saga) {
        const state = yield saga.select(state => state[namespace]);
        const data = createPosition(state);
        const file = JSON.parse(JSON.stringify(state.file || {}));
        delete file.qrCode;
        if (!file.id) {
          delete file.id;
        }
        const titleElement = file.pages && file.pages[0] && file.pages[0].columns &&
          file.pages[0].columns[0] && file.pages[0].columns[0].elements && file.pages[0].columns[0].elements[0];
        if (titleElement && titleElement.type === 'page-title' && titleElement.title !== file.title) {
          file.title = html2text(titleElement.title || '');
        } else {
          file.title = file.name || file.title;
        }
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
    reducers: wrapperCacheWorkspace({
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
        if (runCheckContentOverflow(state)) {
          return {...state, file: ElementObject.create(state.file)}
        }
        return state;
      },

      itemSuccess(state, action) {
        const {result = {}} = action;
        const firstPage = result && result.pages && result.pages[0];
        const activePageKey = firstPage && firstPage.key;
        const firstCol = firstPage && firstPage.columns && firstPage.columns[0];
        const activeColumnKey = firstCol && firstCol.key;
        calculationTotalScore(result);

        return {...state, file: result, activePageKey, activeColumnKey, loading: false};
      },
      set(state, action) {
        return {...state, ...action.payload};
      },

    })
  },
  {
    list, create, item, remove, modify
  }
);

