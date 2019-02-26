import version from './version';
import {PAGE_SIZE} from "./const";
import {mm2px} from "./helper";
import * as ElementObject from './ElementObject';


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
      h: mm2px(height),
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
      columns: []
    });

    for (let j = 0; j < colCount; j++) {
      const col = ElementObject.create({
        width: colWidth,
        height: file.print.h,
        x: j * (colWidth + colSpan),
        y: 0,
        elements: [],
        index: j,
        path: [i, j]
      });
      page.columns.push(col);
    }
    file.pages.push(page);
  }

  return {
    ...state, file
  };
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

function addColumn(state){
  const {file, activePageKey} = state;
  if(activePageKey && file && file.pages){
    const pageIndex = file.pages.findIndex(page=>page.key === activePageKey);
    const page = file.pages[pageIndex];
    if(page){
      const {print: {w, h, colCount, colSpan, colWidth, padding}} = file;
      const j = page.columns.length;
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
  }
  return {...state, file: ElementObject.create(file)};
}

function newFile(state) {
  ElementObject.clear();
  return {...state, file: null};
}

function removeElement(state, action) {
  const {payload: {key}} = action;
  const obj = ElementObject.remove(key);
  if (obj && obj.path) {
    const [pageIndex, columnIndex, elementIndex] = obj.path;
    const {file = {}} = state;
    const page = file.pages[pageIndex];
    const column = page && page.columns[columnIndex];
    if (column && elementIndex >= 0) {
      column.elements.splice(elementIndex, 1);
    } else if (page && columnIndex >= 0) {
      page.columns.splice(columnIndex, 1).forEach(col => {
        col.elements.forEach(ele => {
          ElementObject.remove(ele.key);
        })
      });
    } else if (pageIndex >= 0) {
      file.pages.splice(pageIndex, 1).forEach(page => {
        page.columns.forEach(col => {
          col.elements.forEach(ele => {
            ElementObject.remove(ele.key);
          })
        })
      });
    }
  }
  return {...state};
}

export const reducers = {
  newFile,
  createFile,
  addPage,
  removeElement,
  addColumn,
};


