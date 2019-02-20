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

const ContentEditable = Symbol('#Answer.ContentEditableArea');
const AbleMove = Symbol('#Answer.AbleMove');

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
 * 学号框
 */
class StudentCodeBox extends Component {

  state = {
    value: '',
    length: 8
  };

  componentDidMount() {
    const {value, length = 8} = this.props;
    this.setState({value, length});
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.value !== this.props.value || nextProps.length !== this.props.length) {
      this.setState({value: nextProps.value, length: nextProps.length});
    }
  }


  render() {
    const {focus, value = '', length = 8} = this.state;
    const codes = value.split('');
    for (let i = 0, len = length - codes.length; i < len; i++) {
      codes.push('');
    }
    return (
      <div className={[styles['student-code-box'], focus ? styles['focus'] : ''].join(' ')}>
        <input maxLength={length} value={value}
               onChange={(e) => {
                 const v = e.target.value.replace(/[^\d]/g, '');
                 this.setState({value: v});
                 this.props.onChange && this.props.onChange(v);
               }}
               onFocus={() => {
                 this.setState({focus: true});
                 this.props.onFocus && this.props.onFocus();
               }}
               onBlur={() => {
                 this.setState({focus: false});
                 this.props.onBlur && this.props.onBlur();
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

      </div>
    )
  }
}

/**
 * 可输入区文本提示
 * @param text
 * @returns {*}
 * @constructor
 */
function Placeholder({text}) {
  return (
    <div className={styles['placeholder']}>{text}</div>
  )
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
      this.setState({value: ele.innerHTML, text: ele.innerText});
    });
    ele.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      this.setState({value: ele.innerHTML, text: ele.innerText});
    });
    ele.addEventListener('keyup', e => {
      this.setState({value: ele.innerHTML, text: ele.innerText});
    });
    ele.addEventListener('keydown', (e) => {
      console.log(e);
      if ((e.code === "Minus") && e.altKey) {
        e.preventDefault();
        document.execCommand("insertHTML", false, `<u>　　　　　　　　　　</u>`);
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
      if ((e.code === "Minus") && e.ctrlKey) {
        document.execCommand('underline', false, null);
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
    });
    ele.addEventListener('blur', () => {
      this.setState({focus: false});
    });
    ele.addEventListener('focus', () => {
      this.setState({focus: true});
    });

    ele.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    }, false);

    this.ref.current.appendChild(ele);
    this[ContentEditable] = ele;
  }

  get value() {
    return this.state.innerHTML;
  }

  set value(value) {
    const ele = this[ContentEditable];
    ele.innerHTML = value;
    this.setState({value: ele.innerHTML, text: ele.innerText});
  }

  render() {
    return (
      <div ref={this.ref} className={classNames(
        styles['content-editable-area'],
        this.props.className,
        {
          [styles['focus']]: this.state.focus
        }
      )} onMouseMove={(e) => {
        e.stopPropagation();
      }}>
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

/**
 * 分数区
 * @param value
 * @returns {*}
 * @constructor
 */
function Score({value = 10}) {
  const scores = [];
  for (let i = 0; i <= value; i++) {
    scores.push(
      <div key={i}>{i}</div>
    )
  }
  return (
    <div className={styles['score']}>{scores}</div>
  )
}

/**
 * 主观题
 * @param children
 * @param score
 * @returns {*}
 * @constructor
 */
function SubjectiveQuestionsBox({children, score = 10}) {
  return (
    <div className={styles['subjective-questions-box']}>
      {
        score ?
          <Score value={score}/>
          :
          null
      }

      <main>
        {children}
      </main>
    </div>
  )
}


/**
 * 答题卡组件元素
 */
class Element extends Component {

  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: props.element.y || 0
    }
  }


  handleMouseDown = (e) => {
    if (!this[AbleMove] && this.props.ableMove) {
      const {x, y} = this.state;
      const {clientX, clientY} = e;
      this[AbleMove] = {clientX, clientY, x, y};
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  };

  handleMouseMove = (e) => {
    if (this[AbleMove]) {
      let {clientX, clientY, x, y} = this[AbleMove];
      if (typeof this.props.ableMove === 'string') {
        if (this.props.ableMove.indexOf('x') >= 0) {
          x += e.clientX - clientX;
        }
        if (this.props.ableMove.indexOf('y') >= 0) {
          y += e.clientY - clientY;
        }
      } else {
        x += e.clientX - clientX;
        y += e.clientY - clientY;
      }

      document.body.setAttribute('data-move', 'true');
      this.setState({x, y, move: true});
    }
  };

  handleMouseUp = (e) => {
    if (this[AbleMove]) {
      let {clientX, clientY, x, y} = this[AbleMove];
      if (typeof this.props.ableMove === 'string') {
        if (this.props.ableMove.indexOf('x') >= 0) {
          x += e.clientX - clientX;
        }
        if (this.props.ableMove.indexOf('y') >= 0) {
          y += e.clientY - clientY;
        }
      } else {
        x += e.clientX - clientX;
        y += e.clientY - clientY;
      }
      this.setState({x, y, move: false});
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.body.removeAttribute('data-move');
      delete this[AbleMove];
    }
  };


  render() {

    const {element, border, active, focus, hover, onActive, onFocus, onHover, children, className} = this.props;

    const {x, y, move} = this.state;

    const style = {...this.props.style, transform: `translateX(${x}px) translateY(${y}px)`};

    const props = {
      id: element.key,
      'data-type': element.type,
      className: classNames(className, styles['element'], {
        [styles['active']]: active,
        [styles['focus']]: focus,
        [styles['hover']]: hover,
        [styles['border']]: border,
        [styles['move']]: move
      }),
      style,
      onMouseDown: this.handleMouseDown,
      children,
      onClick: () => {
        onActive && onActive(element);
        onFocus && onFocus(element);
      },
      onMouseEnter: () => {
        onHover && onHover(element, true);
      },
      onMouseLeave: () => {
        onHover && onHover(element, false);
      }
    };

    return (
      <div {...props} />
    )
  }
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
 * 考生信息框
 * @returns {*}
 * @constructor
 */
function StudentInfoBox({value, onChange, style, ...props}) {
  const _style = {...style, width: (value.length || 8) * 28 + 1};
  return (
    <Element className={styles['student-info-box']} style={_style} {...props} element={value}>
      <div className={styles['student-info-header']}>
        <label>班级：</label>
        <label>姓名：</label>
      </div>
      <StudentCodeBox value={value.code} length={value.length || 8} onChange={(code) => {
        value.code = code;
        onChange && onChange(value);
      }}/>
    </Element>
  )
}

StudentInfoBox.attributes = {
  code: {
    type: 'string', label: '学号前缀',
    fieldOptions: {
      initialValue: new Date().getFullYear().toString(),
      rules: [{pattern: /\d+/g, message: '请输入数字学号前缀'}]
    }
  },
  length: {
    type: 'number', label: '学号长度',
    fieldOptions: {
      initialValue: 8,
      rules: [{min: 6, max: 12}]
    },
  },
};


/**
 * 填空题
 * @param number
 * @param count
 * @returns {*}
 * @constructor
 */
class CompletionBox extends Component {

  static attributes = {
    startNumber: {
      type: 'number', label: '起始题号',
      fieldOptions: {
        initialValue: 1,
      }
    },
    score: {
      type: 'number', label: '总分数',
      fieldOptions: {
        initialValue: 10,
      }
    },
    rowCount: {
      type: 'number', label: '大题数量',
      fieldOptions: {
        initialValue: 5,
      }
    },
    colCount: {
      type: 'number', label: '小题数量',
      fieldOptions: {
        initialValue: 3,
      }
    }
  };

  ref = createRef();

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (
      nextProps.value && this._render_content_args !== JSON.stringify(nextProps.value)
    ) {
      console.log('render content', JSON.stringify(nextProps.value), this._render_content_args);
      this.ref.current.value = this.renderContent(nextProps.value);
    }
  }

  renderContent = (value = {}) => {
    const {startNumber = 1, score = 15, rowCount = 5, colCount = 3} = value || {};
    this._render_content_args = JSON.stringify(value || {});
    const ret = [];
    const aveScore = Math.ceil(score / (rowCount));
    const line = '<u>　　　　　　　　　　　　</u>';
    if (score) {
      for (let i = 0; i < rowCount; i++) {
        let str = `<div>${startNumber + i}.`;
        if (colCount < 2) {
          str += `（${aveScore}分）${line}`;
        } else {
          const s = [];
          for (let j = 1; j <= colCount; j++) {
            s.push(`（${j}）${line}`);
          }
          str += `（${aveScore}分）${s.join('　　')}`;
        }
        str += '</div>';
        ret.push(str);
      }
    } else {
      for (let i = 0; i < rowCount; i++) {
        let str = `<div>${startNumber + i}.`;
        if (colCount < 2) {
          str += `${line}`;
        } else {
          const s = [];
          for (let j = 1; j <= colCount; j++) {
            s.push(`（${j}）${line}`);
          }
          str += `${s.join('　　')}`;
        }
        str += '</div>';
        ret.push(str);
      }
    }

    return ret.join('<br/>');
  };

  render() {
    const {value = {}, ...props} = this.props;
    const {score = 15} = value || {};
    return (
      <Element className={styles['completion-box']} {...props} element={value} border ableMove="y">
        <SubjectiveQuestionsBox score={score}>
          <ContentEditableArea ref={this.ref} defaultContent={this.renderContent(this.props.value || {})}/>
        </SubjectiveQuestionsBox>
      </Element>
    )
  }
}


/**
 * 选择题
 * @returns {*}
 * @constructor
 */
function ChoiceQuestionBox({value = {}, ...props}) {
  const {startNumber = 1, count = 10, optionCount = 4} = value || {};
  const ret = [];
  for (let i = startNumber; i < startNumber + count; i++) {
    ret.push(
      <OptionArea key={i} number={i} count={optionCount}/>
    )
  }
  return (
    <Element className={styles['choice-question-box']} {...props} element={value} ableMove>
      {ret}
    </Element>
  )
}

ChoiceQuestionBox.attributes = {
  startNumber: {
    type: 'number', label: '起始题号',
    fieldOptions: {
      initialValue: 1,
    }
  },
  count: {
    type: 'number', label: '数量',
    fieldOptions: {
      initialValue: 10,
    }
  },
  optionCount: {
    type: 'number', label: '选项数量',
    fieldOptions: {
      initialValue: 4,
    }
  }
};

/**
 * 解答题
 * @returns {*}
 * @constructor
 */
function AnswerQuestionBox({value = {}, ...props}) {
  const {number = 1, score = 10} = value || {};
  return (
    <Element className={styles['answer-question-box']} {...props} element={value} border ableMove="y">
      <SubjectiveQuestionsBox score={score}>
        <div className={styles['question-number']}>
          {number}.
          {score ?
            `（${score}分）`
            :
            null
          }
        </div>
        <ContentEditableArea defaultContent={'<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>'}/>
      </SubjectiveQuestionsBox>
    </Element>
  )
}

AnswerQuestionBox.attributes = {
  number: {
    type: 'number', label: '题号',
    fieldOptions: {
      initialValue: 1,
    }
  },
  score: {
    type: 'number', label: '分值',
    fieldOptions: {
      initialValue: 10,
    }
  },
};

const ElementTypes = {
  'student-info': StudentInfoBox,
  'choice-question': ChoiceQuestionBox,
  'answer-question': AnswerQuestionBox,
  'completion-question': CompletionBox
};


function AttributePanelForm({config = {}, form: {getFieldDecorator}, onDelete}) {
  return (
    <Form layout="horizontal">
      {
        Object.entries(config).map(([key, setting]) =>
          <Form.Item key={key} label={setting.label} labelCol={{span: 8}} wrapperCol={{span: 14}}>
            {
              getFieldDecorator(key, setting.fieldOptions)(
                setting.type === 'number' ?
                  <InputNumber onChange={(value) => {
                    console.log(value);
                    setting.onChange && setting.onChange(value);
                  }}/>
                  :
                  <Input onChange={(e) => {
                    console.log(e.target.value);
                    setting.onChange && setting.onChange(e.target.value);
                  }}/>
              )
            }
          </Form.Item>
        )
      }
      <Button onClick={onDelete}>删除</Button>
    </Form>
  )
}

const AttributePanel = Form.create({
  mapPropsToFields: (props) => {
    return Object.entries(props.config).reduce((map, [key, setting]) => {
      map[key] = Form.createFormField({value: setting.value});
      return map;
    }, {});
  }
})(AttributePanelForm);

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
          {key: uuid(), type: 'student-info', y: 80},
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

  insertElementToCurrentColumn = (type, opt = {}) => {
    const col = this.getFocusCol();
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

      y += 10;


      const ele = {
        key: uuid(),
        type,
        y
      };
      col.elements.push(ele);
      this.setState({...this.state}, () => {
        setTimeout(() => {
          this.actionElement(ele.key);
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
        key: 'file', icon: 'mail', title: '文件',
        items: [
          {key: 'new', title: '新建'},
          {key: 'open', title: '打开'},
          {key: 'save', title: '保存'},
          {key: 'save-as', title: '另存为'},
          {key: 'print', title: '打印'},
        ]
      }, {
        key: 'insert', icon: 'appstore', title: '插入',
        items: [
          {key: 'page-title', title: '标题'},
          {key: 'student-info', title: '学生信息'},
          {key: 'choice-question', title: '选择题'},
          {key: 'completion-question', title: '填空题'},
          {key: 'answer-question', title: '解答题'}
        ]
      }
    ];

    const header = (
      <div className={styles['answer-editor-header']}>
        <Menu
          className={styles['answer-edit-menu']}
          onClick={this.handleMenuClick}
          mode="horizontal"
          selectable={false}
        >
          {
            menu.map(sm =>
              <Menu.SubMenu key={sm.key} title={<span><Icon type={sm.icon}/><span>{sm.title}</span></span>}>
                {
                  sm.items.map(it =>
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
    );

    return (
      <Page header={header}
            mainClassName={styles['answer-page']}
            className={styles['answer-editor']}
            location={location}
            loading={!!loading}
            footer={

              <footer className={styles['answer-editor-attribute-panel']}>
                {
                  this.state.activeKey ?
                    <AttributePanel config={this.state.attributePanelConfig || {}} onDelete={() => {
                      this.handleDeleteElement();
                    }}/>
                    :
                    null
                }
              </footer>
            }
      >

          <div className={styles['editor-page']} style={editorPageStyle}>
            {this.renderCols()}
            {this.renderQrCode()}
          </div>

      </Page>
    );
  }

  renderCols = () => {
    return this.state.cols.map((col, index) =>
      <div id={col.key} className={classNames(styles['editor-page-col'], {
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
        {this.renderElements(col.elements, index)}
      </div>
    )
  };

  getElement = (key) => {
    for (let i = 0; i < this.state.cols.length; i++) {
      const col = this.state.cols[i];
      if (col.elements && col.elements.length) {
        for (let j = 0; j < col.elements.length; j++) {
          if (col.elements[j].key === key) {
            return col.elements[j];
          }
        }
      }
    }
    return null;
  };

  actionElement = (key) => {
    console.log('激活组件', key);
    const state = {activeKey: key};
    const ele = this.getElement(key);
    const eleClass = ElementTypes[ele.type];
    if (eleClass && eleClass.attributes) {
      const config = Object.entries(eleClass.attributes).reduce((map, [key, obj]) => {
        map[key] = {
          ...obj,
          value: ele[key],
          onChange: (value) => {
            setTimeout(() => {
              config[key].value = value;
              ele[key] = value;
              this.setState({...this.state});
            });
          }
        };
        return map;
      }, {});
      state.attributePanelConfig = config;
      state.showAttributePanel = true;
    } else {
      state.showAttributePanel = false;
    }
    this.setState(state);
  };

  handleDeleteElement = () => {
    const {activeKey} = this.state;
    if (activeKey) {
      for (let i = 0; i < this.state.cols.length; i++) {
        const col = this.state.cols[i];
        if (col.elements && col.elements.length) {
          for (let j = 0; j < col.elements.length; j++) {
            if (col.elements[j].key === activeKey) {
              setTimeout(() => {
                this.state.cols[i].elements.splice(j, 1);
                this.setState({...this.state, activeKey: null});
              });
              return;
            }
          }
        }
      }
    }
  };

  renderElements = (elements, colIndex) => {
    const onChange = () => {
      setTimeout(() => {
        this.setState({...this.state})
      });
    };
    const onActive = (ele) => {
      setTimeout(() => {
        this.actionElement(ele.key);
      });
    };
    const onFocus = (ele) => {
      setTimeout(() => {
        this.setState({focusKey: ele.key});
      });
    };
    const buildProps = (value, index) => {
      return {
        index: [colIndex, index],
        value,
        onChange,
        onActive,
        onFocus,
        style: {zIndex: index},
        active: value.key === this.state.activeKey,
        focus: value.key === this.state.focusKey,
      }
    };
    return (
      elements && elements.length ?
        elements.map((ele, index) =>
          <Fragment key={ele.key}>
            {
              ele.type === 'page-title' ?
                <TitleBox {...buildProps(ele, index)}/>
                :
                ele.type === 'student-info' ?
                  <StudentInfoBox {...buildProps(ele, index)}/>
                  :
                  ele.type === 'choice-question' ?
                    <ChoiceQuestionBox {...buildProps(ele, index)}/>
                    :
                    ele.type === 'completion-question' ?
                      <CompletionBox {...buildProps(ele, index)}/>
                      :
                      ele.type === 'answer-question' ?
                        <AnswerQuestionBox {...buildProps(ele, index)}/>
                        :
                        null
            }
          </Fragment>
        )
        :
        null
    )
  };

  renderQrCode = () => {
    return this.state.qrCode ?
      <img className={styles['page-qrcode']}
           style={{left: this.state.page.padding[3] - 14, top: this.state.page.padding[0] - 14}}
           src={this.state.qrCode}/>
      :
      null
  }
}
