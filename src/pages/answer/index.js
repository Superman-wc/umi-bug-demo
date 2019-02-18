import React, {Component, Fragment, createRef} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {
  Form,
  Row,
  Col,
  notification,
  Checkbox,
  Button,
  Card,
  Dropdown,
  Menu,
  Icon,
  Input,
  InputNumber,
  Popover
} from 'antd';
import {Authenticate, ManagesSemester, ManagesGrade} from '../../utils/namespace';
import Page from '../../components/Page';
import PageHeaderOperation from '../../components/Page/HeaderOperation';
import styles from './index.less';
import Flex from '../../components/Flex';
import Editor from '../../components/AnswerCardEditor';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import QrCode from '../../components/AnswerCardEditor/QrCode';

/**
 * transform样式显性转换成对象类型
 * @param str
 * @returns {{}}
 */
function transformParse(str = '') {
  return str.split(/\s+/g).reduce((map, s) => {
    const m = s.split(/(|)/g);
    map[m[0]] = m[1];
    return map;
  }, {});
}

/**
 * transform样式对象转换成样式文本
 * @param obj
 * @returns {string}
 */
function transforStringify(obj = {}) {
  return Object.entries(obj).reduce((arr, [key, value]) => {
    arr.push(`${key}(${value})`);
    return arr;
  }, []).join(' ')
}

/**
 * 毫米转英寸
 * @param mm
 * @returns {number}
 */
function mm2inch(mm) {
  return mm / 25.4; // 一英寸 = 25.4mm
}

/**
 * 毫米转像素
 * @param mm
 * @param dpi
 * @returns {number}
 */
function mm2px(mm, dpi = 96) {
  return Math.round(mm2inch(mm) * dpi);
}

/**
 * 纸张大小
 */
const PAGE_SIZE = {
  A4: {
    print: {
      height: 297,
      width: 210,
    },
  },
  '16K': {
    print: {
      width: 195,
      height: 271,
    },
  },
  '8K': {
    print: {
      width: 420,
      height: 285,
    },
  },
};

/**
 * 转换纸张大小为屏幕像素大小
 */
Object.keys(PAGE_SIZE).forEach(key => {
  const {width, height} = PAGE_SIZE[key].print;
  PAGE_SIZE[key].screen = {
    width: mm2px(width),
    height: mm2px(height)
  }
});


export default class AnswerEditPage extends Component {

  state = {
    page: {
      ...PAGE_SIZE.A4.screen,     // 纸张的屏幕大小
      type: 'A4',                 // 默认为A4纸张
      colsCount: 1,               // 纸张分栏数量
      colSpan: 10,                // 纸张分栏边距
      padding: [60, 45, 60, 45],  // 纸张边距
    },
    cols: [
      {
        key: uuid(),
        width: PAGE_SIZE.A4.screen.width, // 分栏宽度
        elements: [
          {key: uuid(), type: 'page-title'},
          {key: uuid(), type: 'student-info'},
        ]
      },
    ]
  };

  componentDidMount() {
    document.body.id = styles['answer-edit-body'];
    document.querySelector('#root').className = styles['answer-editor-page'];
    this.buildQrCode();
  }

  componentWillUnmount() {
    document.body.id = '';
    document.querySelector('#root').className = '';
  }

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

  insertElementToCurrentColumn = (type) => {
    const col = this.getFocusCol();
    if (col) {
      if (!col.elements) {
        col.elements = [];
      }
      col.elements.push({
        key: uuid(),
        type,
      });
      this.setState({...this.state});
    }
  };

  insertPageTitle = () => {
    this.insertElementToCurrentColumn('page-title');
  };

  insertStudentInfo = () => {
    this.insertElementToCurrentColumn('student-info');
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


  getFocusCol = () => {
    const {cols} = this.state;
    return cols.find(it => it.focus) || cols[0];
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
  };

  render() {
    const {
      loading, location,
    } = this.props;

    console.log(this.state);

    const {page} = this.state;

    const editorPageStyle = {
      width: page.width,
      height: page.height,
      padding: page.padding.map(it => it + 'px').join(' '),
      // transform: 'scale(0.5)'
    };

    const menu = [
      {
        key:'file', icon:'mail', title:'文件',
        items:[
          {key:'new', title:'新建'},
          {key:'open', title:'打开'},
          {key:'save', title:'保存'},
          {key:'save-as', title:'另存为'},
          {key:'print', title:'打印'},
        ]
      },{
        key:'insert', icon:'appstore', title:'插入',
        items:[
          {key:'page-title', title:'标题'},
          {key:'student-info', title:'学生信息'},
          {key:'choice-question', title:'选择题'},
          {key:'completion-question', title:'填空题'},
          {key:'answer-question', title:'解答题'}
        ]
      }
    ];

    return (
      <Page header={
        <div className={styles['answer-editor-header']}>
          <Menu
            className={styles['answer-edit-menu']}
            onClick={this.handleMenuClick}
            mode="horizontal"
            selectable={false}
          >
            {
              menu.map(sm=>
                <Menu.SubMenu key={sm.key} title={<span><Icon type={sm.icon}/><span>{sm.title}</span></span>}>
                  {
                    sm.items.map(it=>
                      <Menu.Item key={it.key}>{it.title}</Menu.Item>
                    )
                  }
                </Menu.SubMenu>
              )
            }
            <Menu.SubMenu key="page" title={<span><Icon type="setting"/><span>纸张</span></span>}>
              {
                Object.entries(PAGE_SIZE).map(([key, size]) =>
                  <Menu.Item key={key}>
                    {`${key} (${size.print.width}x${size.print.height}mm)`}
                    <MenuChecked show={this.state.page.type === key}/>
                  </Menu.Item>
                )
              }
              <Menu.Divider/>
              <Menu.Item key="col-1">
                页面不分割
                <MenuChecked show={this.state.page.colsCount === 1}/>
              </Menu.Item>
              <Menu.Item key="col-2">
                页面分割为两列
                <MenuChecked show={this.state.page.colsCount === 2}/>
              </Menu.Item>
              <Menu.Item key="col-3">
                页面分割为三列<MenuChecked show={this.state.page.colsCount === 3}/>
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </div>
      }
            mainClassName={styles['answer-page']}
            className={styles['answer-editor']}
            location={location}
            loading={!!loading}
      >
        <div className={styles['editor-page']} style={editorPageStyle}>
          {
            this.state.cols.map((col, index) =>
              <div className={classNames(styles['editor-page-col'], {
                [styles['editor-page-col-focus']]: col.focus
              })}
                   key={col.key}
                   style={{width: col.width}}
                   onClick={() => {
                     this.state.cols.forEach(col => {
                       delete col.focus;
                     });
                     this.state.cols[index].focus = true;
                     this.setState({...this.state});
                   }}
              >
                {
                  col.elements && col.elements.length ?
                    col.elements.map((ele, zIndex) =>
                      ele.type === 'page-title' ?
                        <TitleBox key={ele.key} style={{zIndex}}/>
                        :
                        ele.type === 'student-info' ?
                          <StudentInfoBox key={ele.key} style={{zIndex}}/>
                          :
                          ele.type === 'choice-question' ?
                            <ChoiceQuestionBox key={ele.key} style={{zIndex}} startNumber={1} count={5}/>
                            :
                            ele.type === 'completion-question' ?
                              <SubjectiveQuestionsBox key={ele.key} style={{zIndex}} score={2}>
                                <CompletionBoxGroup startNumber={11} count={1}/>
                              </SubjectiveQuestionsBox>
                              :
                              ele.type === 'answer-question' ?
                                <AnswerQuestionBox key={ele.key} style={{zIndex}}/>
                                :
                                null
                    )
                    :
                    null
                }
              </div>
            )
          }
          {/*<TitleBox/>*/}
          {/*<StudentInfoBox/>*/}
          {/*<ChoiceQuestionBox startNumber={1} count={5}/>*/}
          {/*<ChoiceQuestionBox startNumber={6} count={5} optionCount={6}/>*/}
          {/*<SubjectiveQuestionsBox score={20}>*/}
          {/*<CompletionBoxGroup startNumber={11} count={5}/>*/}
          {/*</SubjectiveQuestionsBox>*/}
          {/*<Editor />*/}
          {
            this.state.qrCode ?
              <img className={styles['page-qrcode']}
                   style={{left: this.state.page.padding[3] - 14, top: this.state.page.padding[0] - 14}}
                   src={this.state.qrCode}/>
              :
              null
          }
        </div>
      </Page>
    );
  }
}

function MenuChecked({show}) {
  return (
    <Fragment>
      {
        show ?
          <Icon type="check" style={{
            position: 'absolute', right: 0, top: '50%',
            marginTop: -6, color: '#1DA57A'
          }}/>
          :
          null
      }
    </Fragment>
  )
}


function SubjectiveQuestionsBox({children, score = 10}) {
  const scores = [];
  for (let i = 0; i <= score; i++) {
    scores.push(
      <div key={i}>{i}</div>
    )
  }
  return (
    <div className={styles['subjective-questions-box']}>
      <header>
        {scores}
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}

/**
 * 填空题
 * @param number
 * @param count
 * @returns {*}
 * @constructor
 */
function CompletionBox({number = 1, count = 1}) {
  const ret = [];
  for (let i = 0; i < count; i++) {
    ret.push(
      <CompletionArea key={i} defaultText={count > 1 ? `(${i + 1})` : ''}/>
    )
  }
  return (
    <div className={styles['completion-box']}>
      <label>{number}</label>
      <div>
        {ret}
      </div>
    </div>
  )
}

/**
 * 填空题组
 * @param startNumber
 * @param count
 * @param lineCount
 * @returns {*}
 * @constructor
 */
function CompletionBoxGroup({startNumber = 1, count = 1, lineCount = 1}) {
  const ret = [];
  for (let i = startNumber; i < startNumber + count; i++) {
    ret.push(
      <CompletionBox key={i} number={i} count={i - startNumber + 1}/>
    )
  }
  return (
    <div className={styles['completion-group']}>
      {ret}
    </div>
  )
}

/**
 * 填空题区域
 */
class CompletionArea extends Component {

  ref = createRef();

  componentDidMount() {
    const span = document.createElement('span');
    span.innerHTML = this.props.defaultText ? `<span>${this.props.defaultText}</span>` : '　　　　　　　　　　';
    span.setAttribute('contentEditable', true);
    span.addEventListener('input', (e) => {
      console.log(e);
    });
    span.addEventListener('blur', console.log);
    span.addEventListener('focus', console.log);
    this.ref.current.appendChild(span);
  }

  render() {
    return (
      <div ref={this.ref} className={styles['completion-area']}>
        {/*<label>*/}
        {/*<input/>*/}
        {/*</label>*/}
      </div>
    )
  }
}

function clearElementStyle(ele) {
  console.log(ele);
  for (let i = 0; i < ele.children.length; i++) {
    clearElementStyle(ele.children[i]);
    ele.removeAttribute('style');
  }
}

/**
 * 可编辑区
 */
class ContentEditableArea extends Component {
  ref = createRef();

  state = {
    value: '',
    text: '',
  };

  componentDidMount() {
    const ele = document.createElement('div');
    ele.className = styles['content-editable-area-input'];
    ele.innerHTML = this.props.defaultContent || '';
    ele.setAttribute('contentEditable', true);
    ele.addEventListener('input', (e) => {
      console.log(e);
      if (e.inputType === 'insertFromPaste') {

      }
    });
    ele.addEventListener("paste", function (e) {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });
    ele.addEventListener('keyup', e => {
      this.setState({value: ele.innerHTML, text: ele.innerText});
    });
    ele.addEventListener('blur', () => {
      this.setState({focus: false});
    });
    ele.addEventListener('focus', () => {
      this.setState({focus: true});
    });
    this.ref.current.appendChild(ele);
  }

  render() {
    return (
      <div ref={this.ref} className={classNames(
        styles['content-editable-area'],
        this.props.className,
        {
          [styles['focus']]: this.state.focus
        }
      )}>
        {this.props.children}
        {
          this.props.placeholder && !this.state.text ?
            <Placeholder text={this.props.placeholder}/>
            :
            null
        }
      </div>
    )
  }
}

function Placeholder({text}) {
  return (
    <div className={styles['placeholder']}>{text}</div>
  )
}

/**
 * 答题卡标题
 * @param title
 * @returns {*}
 * @constructor
 */
function TitleBox({title}) {
  return (
    <ContentEditableArea placeholder="请输入标题" defaultContent={title} className={styles['answer-page-title']}/>
  )
}

/**
 * 解答题
 * @param number
 * @param score
 * @returns {*}
 * @constructor
 */
function AnswerQuestionBox({number = 1, score = 10}) {
  return (
    <div className={styles['answer-question-box']}>
      <SubjectiveQuestionsBox>
        <div className={styles['question-number']}>{number}.（{score}分）</div>
        <ContentEditableArea defaultContent={'<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>'}/>
      </SubjectiveQuestionsBox>
    </div>
  )
}

/**
 * 考生信息框
 * @returns {*}
 * @constructor
 */
function StudentInfoBox({style}) {
  return (

    <div className={styles['student-info-box']}>
      <div className={styles['student-info-header']}>
        <label>班级：</label>
        <label>姓名：</label>
      </div>
      <StudentCodeBox code={'2017'} length={8}/>
    </div>
  )
}

/**
 * 数字号码区
 * @param value
 * @returns {Array}
 * @constructor
 */
function NumberArea({value}) {
  const ret = [];
  for (let i = 0; i < 10; i++) {
    ret.push(
      <DaubRectangleBox key={i} checked={i + '' === value} value={i}/>
    )
  }
  return ret;
}

/**
 * 选择题涂卡区
 * @param number
 * @param count
 * @returns {*}
 * @constructor
 */
function OptionArea({number = 1, count = 4}) {
  const ret = [];
  for (let i = 65; i < 65 + count; i++) {
    ret.push(
      <DaubRectangleBox key={i} value={String.fromCharCode(i)}/>
    )
  }
  return (
    <div className={styles['options-area']}>
      <label>{number}</label>
      {ret}
    </div>
  )
}

/**
 * 选择题
 * @param startNumber
 * @param count
 * @param optionCount
 * @returns {*}
 * @constructor
 */
function ChoiceQuestionBox({startNumber = 1, count = 10, optionCount = 4, style}) {
  const ret = [];
  for (let i = startNumber; i < startNumber + count; i++) {
    ret.push(
      <OptionArea key={i} number={i} count={optionCount}/>
    )
  }
  return (
    <AbleMoveBox style={style}>
      <div className={styles['choice-question-box']}>
        {ret}
      </div>
    </AbleMoveBox>
  )
}

const AbleMove = Symbol('#Answer.AbleMove');

/**
 * 支持移动组件
 */
class AbleMoveBox extends Component {

  state = {
    translateY: 0,
    translateX: 0,
  };

  handleMouseDown = (e) => {
    if (!this[AbleMove]) {
      const {translateY, translateX} = this.state;
      const {clientX, clientY} = e;
      this[AbleMove] = {clientX, clientY, translateY, translateX};
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  };

  handleMouseMove = (e) => {
    if (this[AbleMove]) {
      let {clientX, clientY, translateY, translateX} = this[AbleMove];
      translateX += e.clientX - clientX;
      translateY += e.clientY - clientY;
      this.setState({translateY, translateX, active: true});
    }
  };

  handleMouseUp = (e) => {
    if (this[AbleMove]) {
      let {clientX, clientY, translateY, translateX} = this[AbleMove];
      translateX += e.clientX - clientX;
      translateY += e.clientY - clientY;
      this.setState({translateY, translateX, active: false});
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      delete this[AbleMove];
    }
  };


  render() {

    const style = {...this.props.style};
    const {translateY, translateX} = this.state;
    if (translateX || translateY) {
      style.position = 'absolute';
      style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
    } else {
      style.position = 'relative';
      style.transform = ''
    }

    return (
      <div className={classNames(styles['able-move-box'], {[styles['active']]: this.state.active})} style={{...style}}
           onMouseDown={this.handleMouseDown}>
        {this.props.children}
      </div>
    )
  }
}


/**
 * 涂抹矩形框
 * @param checked
 * @param value
 * @returns {*}
 * @constructor
 */
function DaubRectangleBox({checked, value}) {
  return (
    <div data-checked={checked} className={styles['daub-rectangle-box']}>
      <div>{value}</div>
    </div>
  )
}

/**
 * 学号框
 */
class StudentCodeBox extends Component {

  state = {
    code: '',
    length: 8
  };

  componentDidMount() {
    const {code, length = 8} = this.props;
    this.setState({code, length});
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.code !== this.props.code || nextProps.length !== this.props.length) {
      this.setState({code: nextProps.code, length: nextProps.length});
    }
  }


  render() {
    const {focus, code, length = 8} = this.state;
    const codes = code.split('');
    for (let i = 0, len = length - codes.length; i < len; i++) {
      codes.push('');
    }
    return (
      <label className={[styles['student-code-box'], focus ? styles['focus'] : ''].join(' ')}>
        <input maxLength={length} value={code}
               onChange={(e) => {
                 this.setState({code: e.target.value.replace(/[^\d]/g, '')});
               }}
               onFocus={() => {
                 this.setState({focus: true});
               }}
               onBlur={() => {
                 this.setState({focus: false});
               }}
        />
        {
          codes.map((value, key) =>
            <div key={key} className={styles['student-code-col']}>
              <div className={styles['student-code-value']}>{value}</div>
              <NumberArea value={value}/>
            </div>
          )
        }

      </label>
    )
  }
}
