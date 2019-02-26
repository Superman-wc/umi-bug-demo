import React, {Component, Fragment, createRef} from 'react';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import styles from './answer.less';
import {mm2px} from "./helper";
import {PAGE_SIZE} from "./const";
import QrCode from "./QrCode";
import EditorHeader from './EditorHeader';
import EditorRightPanel from './EditorRightPanel';
import EditorBody from './EditorBody';



export default class Editor extends Component {

  state = {};

  componentDidMount() {
    document.body.id = styles['editor'];
    document.querySelector('#root').className = styles['editor-root'];
    this.buildQrCode();
  }

  componentWillUnmount() {
    document.body.id = '';
    document.querySelector('#root').className = '';
  }

  getPage = key => {
    for (let page of this.state.file.pages) {
      if (page.key === key) {
        return page;
      }
    }
    return null;
  };

  getCol = (key, pageKey) => {
    if (pageKey) {
      const page = this.getPage(pageKey);
      if (page) {
        for (let col of page.cols) {
          if (col.key === key) {
            return col;
          }
        }
      }
    }
    for (let page of this.state.file.pages) {
      for (let col of page.cols) {
        if (col.key === key) {
          return col;
        }
      }
    }
    return null;
  };

  getElement = (key, colKey, pageKey) => {
    if (pageKey && colKey) {
      const col = this.getCol(colKey, pageKey);
      if (col) {
        for (let ele of col.elements) {
          if (ele.key === key) {
            return ele;
          }
        }
      }
    }
    for (let page of this.state.file.pages) {
      for (let col of page.cols) {
        for (let ele of col.elements) {
          if (ele.key === key) {
            return ele;
          }
        }
      }
    }
    return null;
  };

  getActivePage = () => {
    return this.getPage(this.state.activePageKey) || this.state.file.pages[0];
  };

  getActiveCol = () => {
    return this.getCol(this.state.activeColKey, this.state.activePageKey) || this.state.file.pages[0].cols[0];
  };

  getActiveElement = () => {
    return this.getElement(
      this.state.activeElementKey,
      this.state.activeColKey,
      this.state.activePageKey
    ) || this.state.file.pages[0].cols[0].elements[0]
  };


  setPageSize = (type) => {
    const page = PAGE_SIZE[type];
    if (page && page.screen) {
      this.setState({page: {...this.state.page, ...page.screen, type}}, () => {
        this.setPageCols(this.state.page.colsCount);
      });
    }
  };


  setPageCols = (colsCount = 2) => {
    let {padding, colSpan, width} = this.state.page;

    width = Math.floor((width - padding[1] - padding[3] - (colsCount - 1) * colSpan) / colsCount);
    const cols = [];
    for (let i = 0; i < colsCount; i++) {
      const col = this.state.cols[i] || {key: uuid()};
      col.width = width;
      cols.push(col);
    }
    this.setState({cols, page: {...this.state.page, colsCount}});
  };

  insertElementToCurrentColumn = (type, opt = {}) => {
    const col = this.getActiveCol();
    if (col) {
      if (!col.elements) {
        col.elements = [];
      }
      const colHtmlElement = document.getElementById(col.key);
      const t = colHtmlElement.getBoundingClientRect().top;

      let y = opt.y || 0;
      for (let htmlElement of colHtmlElement.children) {
        const {top, height} = htmlElement.getBoundingClientRect();
        y = Math.max(y, top + height - t);
      }

      if (y) {
        y += 10;
      }


      const ele = {
        key: uuid(),
        type,
        y
      };
      col.elements.push(ele);
      this.setState({file: {...this.state.file}}, () => {
        setTimeout(() => {
          this.activeElement(ele.key);
        });
      });
    }
  };

  insertPageTitle = () => {
    this.insertElementToCurrentColumn('page-title');
  };

  insertStudentInfo = () => {
    this.insertElementToCurrentColumn('student-info', {y: 80});
  };

  insertChoiceQuestion = () => {
    this.insertElementToCurrentColumn('choice-question');
  };

  insertCompletionQuestion = () => {
    this.insertElementToCurrentColumn('completion-question');
  };
  insertAnswerQuestion = () => {
    this.insertElementToCurrentColumn('answer-question');
  };

  buildQrCode = () => {
    QrCode().then(qrCode => this.setState({qrCode}));
  };


  handleMenuClick = ({key, keyPath}) => {
    if (keyPath && keyPath[keyPath.length - 1] === 'page') {
      if (PAGE_SIZE[key]) {
        this.setPageSize(key);
      } else if (key === 'col-1') {
        this.setPageCols(1);
      } else if (key === 'col-2') {
        this.setPageCols(2);
      } else if (key === 'col-3') {
        this.setPageCols(3);
      }
    }
    else if (keyPath && keyPath[keyPath.length - 1] === 'insert') {
      if (key === 'page-title') {
        this.insertPageTitle();
      } else if (key === 'student-info') {
        this.insertStudentInfo();
      } else if (key === 'choice-question') {
        this.insertChoiceQuestion()
      } else if (key === 'completion-question') {
        this.insertCompletionQuestion();
      } else if (key === 'answer-question') {
        this.insertAnswerQuestion();
      }
    }
    else if (keyPath && keyPath[keyPath.length - 1] === 'file') {
      if (key === 'new') {
        this.setState({file: null});
      }
    }
  };


  createFile = (config = {}) => {
    const file = {
      ...config,
      version: '1.0',
      pages: [],
    };

    const firstPage = this.createPage(file);

    console.log(firstPage);

    const firstCol = firstPage.cols[0];

    firstCol.elements.push({key: uuid(), type: 'page-title', value: config.title});
    firstCol.elements.push({
      key: uuid(),
      type: 'student-info',
      length: 8,
      code: new Date().getFullYear().toString(),
      y: 80
    });

    if (config.choiceCount) {
      const ys = config.choiceCount % 5;
      let gs = Math.ceil(config.choiceCount / 5) + (ys === 0 ? 1 : 0);
      const cqw = 114 + 20;
      const cqh = 92 + 10;
      let i = 0;
      for (; i < gs - 1; i++) {
        firstCol.elements.push({
          key: uuid(),
          type: 'choice-question',
          x: 250 + (i % 3) * cqw,
          y: 80 + Math.floor(i / 3) * cqh,
          startNumber: i * 5 + 1,
          count: 5,
          optionCount: 4
        });
      }
      if (ys) {
        firstCol.elements.push({
          key: uuid(),
          type: 'choice-question',
          x: 250 + (i % 3) * cqw,
          y: 80 + Math.floor(i / 3) * cqh,
          startNumber: i * 5 + 1,
          count: ys,
          optionCount: 4
        });
      }
    }

    if (config.completionCount) {
      if (config.statisticsScore) {
        const cs = (config.choiceCount || 0) + 1;
        const cys = 312;
        const ch = 71 + 10;
        for (let i = 0; i < config.completionCount; i++) {
          firstCol.elements.push({
            key: uuid(),
            type: 'completion-question',
            y: cys + ch * i,
            startNumber: cs + i,
            rowCount: 1,
            colCount: 3,
            statisticsScore: config.statisticsScore,
            score: 6
          });
        }
      } else {
        firstCol.elements.push({
          key: uuid(), type: 'completion-question', y: 312, startNumber: (config.choiceCount || 0) + 1,
          rowCount: config.completionCount,
          colCount: 3,
          // statisticsScore: config.statisticsScore,
          // score: 15
        });
      }
    }

    if (config.answerCount) {
      const as = ((config.choiceCount + config.completionCount) || 0) + 1;
      const ays = config.statisticsScore ? 717 : 534;
      const ah = config.statisticsScore ? 284 : 265;
      for (let i = 0; i < config.answerCount; i++) {
        firstCol.elements.push({
          key: uuid(), type: 'answer-question',
          y: ays + i * ah,
          number: as + i,
          statisticsScore: config.statisticsScore,
          score: 10,
        });
      }
    }

    file.pages.push(firstPage);

    this.setState({file});
  };

  createPage = (config) => {
    let {padding, colSpan, colsCount, type, dpi} = config;
    const page = {
      key: uuid(), type,
      padding, colSpan, colsCount,
      width: mm2px(PAGE_SIZE[type].print.width, dpi),
      height: mm2px(PAGE_SIZE[type].print.height, dpi),
    };
    page.cols = this.createCols(page);
    return page;
  };

  createCols = (config) => {
    let {padding, colSpan, width, colsCount} = config;
    const colWidth = Math.floor((width - padding[1] - padding[3] - (colsCount - 1) * colSpan) / colsCount);
    const cols = [];
    for (let i = 0; i < colsCount; i++) {
      cols.push({key: uuid(), width: colWidth, elements: [], colSpan});
    }
    return cols;
  };

  render() {

    return (
      <Fragment>
        <EditorHeader />
        <EditorBody />
        <EditorRightPanel />
      </Fragment>
    );
  }



  handleDeleteElement = () => {
    const {activeElementKey} = this.state;
    if (activeElementKey) {
      for (let page of this.state.file.pages) {
        for (let col of page.cols) {
          for (let i = 0; i < col.elements.length; i++) {
            if (col.elements[i].key === activeElementKey) {
              setTimeout(() => {
                col.elements.splice(i, 1);
                this.setState({file: {...this.state.file}, activeElementKey: null});
              });
              return;
            }
          }
        }
      }
    }
  };

  renderQrCode = () => {
    return this.state.qrCode && this.state.file ?
      <img className={styles['qr-code']}
           style={{left: this.state.file.padding[3] - 14, top: this.state.file.padding[0] - 14}}
           src={this.state.qrCode}/>
      :
      null
  }
}



