import React, {Component, Fragment, createRef} from 'react';
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
  Select,
} from 'antd';

import styles from './answer.less';

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
    direction: '纵向',
    print: {
      height: 297,
      width: 210,
    },
  },
  '16K': {
    direction: '纵向',
    print: {
      width: 195,
      height: 271,
    },
  },
  '8K': {
    direction: '横向',
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
function SubjectiveQuestionsBox({children, score = 10, statisticsScore = false}) {
  return (
    <div className={styles['subjective-questions-box']}>
      {
        score && statisticsScore ?
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
      x: props.element.x || 0,
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
  const {number = 1, score = 10, statisticsScore = false} = value || {};
  return (
    <Element className={styles['answer-question-box']} {...props} element={value} border ableMove="y">
      <SubjectiveQuestionsBox score={score} statisticsScore={statisticsScore}>
        <div className={styles['question-number']}>
          {number}.
          {statisticsScore && score ?
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
    const {startNumber = 1, score = 15, rowCount = 5, colCount = 3, statisticsScore = false} = value || {};
    this._render_content_args = JSON.stringify(value || {});
    const ret = [];
    const aveScore = Math.ceil(score / (rowCount));
    const line = '<u>　　　　　　　　　　　　</u>';
    if (score && statisticsScore) {
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
    const {score = 15, statisticsScore = false} = value || {};
    return (
      <Element className={styles['completion-box']} {...props} element={value} border ableMove="y">
        <SubjectiveQuestionsBox score={score} statisticsScore={statisticsScore}>
          <ContentEditableArea ref={this.ref} defaultContent={this.renderContent(this.props.value || {})}/>
        </SubjectiveQuestionsBox>
      </Element>
    )
  }
}

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

class PaddingEditor extends Component {
  render() {
    const {value = [60, 45, 60, 45], onChange, min = 0, max = 200} = this.props;
    const buildProps = (index) => {
      return {
        style: {width: 60},
        max,
        min,
        value: value[index],
        onChange: v => {
          value[index] = v;
          onChange(value);
        }
      }
    };
    return (
      <div className={styles['padding-editor']}>
        <div/>
        <div><InputNumber {...buildProps(0)}/></div>
        <div/>
        <div><InputNumber {...buildProps(3)}/></div>
        <div/>
        <div><InputNumber {...buildProps(1)}/></div>
        <div/>
        <div><InputNumber {...buildProps(2)}/></div>
      </div>
    )
  }
}

function CreateFileForm({form: {getFieldDecorator, validateFieldsAndScroll}, onSubmit}) {
  return (
    <Form layout="horizontal" className={styles['editor-create-panel']} hideRequiredMark onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      validateFieldsAndScroll((errors, values) => {
        if (errors) {
          console.error(errors);
        } else {
          console.log(values);
          onSubmit && onSubmit(values);
        }
      })
    }}>
      <Form.Item label="考试或作业名称" help="例如：2019年杭州第十四中学康桥校区高一年级暑假作业检测" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('title', {
            initialValue: '这是测试用的',
            rules: [{required: true, message: '必须填写'}]
          })(
            <Input placeholder="请输入考试或作业名称"/>
          )
        }
      </Form.Item>

      <Form.Item label="选择题数量" help="单选题、多选题统一设置数量" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('choiceCount', {
            initialValue: 30,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} min={0} max={100}/>
          )
        }
      </Form.Item>
      <Form.Item label="填空题数量" help="此项指填空题大题数量，自动生成每大题下3个小题" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('completionCount', {
            initialValue: 5,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} min={0} max={20}/>
          )
        }
      </Form.Item>
      <Form.Item label="解答题数量" help="需要较大范围用于填写答案的都计为此项" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('answerCount', {
            initialValue: 1,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} min={0} max={20}/>
          )
        }
      </Form.Item>
      <Form.Item labelCol={{span: 8}} help="此项决定主观题是否需要划分模块" wrapperCol={{offset: 8, span: 14}}>
        {
          getFieldDecorator('statisticsScore', {
            valuePropName: 'checked'
          })(
            <Checkbox>是否统计分数</Checkbox>
          )
        }
      </Form.Item>
      <hr style={{marginBottom: '2em'}}/>
      <Form.Item label="分辨率" help="此项视打印机情况而定，一般为96DPI" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('dpi', {
            initialValue: 96,
            rules: [{required: true, message: '必须填写'}]
          })(
            <Select style={{width: 90}}>
              {
                [72, 96, 120, 300].map((value) =>
                  <Select.Option key={value}
                                 value={value}>{value}</Select.Option>
                )
              }
            </Select>
          )
        }
      </Form.Item>
      <Form.Item label="纸张大小" help="纸张大小设置应于打印时设置一致" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('type', {
            initialValue: 'A4',
            rules: [{required: true, message: '必须填写'}]
          })(
            <Select style={{width: 220}}>
              {
                Object.entries(PAGE_SIZE).map(([key, page]) =>
                  <Select.Option key={key}
                                 value={key}>{`${key} (${page.print.width}x${page.print.height}mm ${page.direction})`}</Select.Option>
                )
              }
            </Select>
          )
        }
      </Form.Item>
      <Form.Item label="纸张边距" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('padding', {
            initialValue: [60, 45, 60, 45],
            rules: [{required: true, message: '必须填写'}]
          })(
            <PaddingEditor/>
          )
        }
      </Form.Item>
      <Form.Item label="纸张分列数量" help="A4、16K建议1列，8K建议2列" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('colsCount', {
            initialValue: 1,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} max={3} min={1}/>
          )
        }
      </Form.Item>
      <Form.Item label="分列间距" labelCol={{span: 8}} wrapperCol={{span: 14}}>
        {
          getFieldDecorator('colSpan', {
            initialValue: 30,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} max={100} min={0}/>
          )
        }
      </Form.Item>
      <Form.Item wrapperCol={{offset: 8, span: 14}}>
        <Button type="primary" htmlType="submit" style={{width: 120}}>创建</Button>
        <Button type="danger" htmlType="reset" style={{width: 120, marginLeft: '1em'}}>重置</Button>
      </Form.Item>
    </Form>
  );
}

const CreateFileFormPanel = Form.create()(CreateFileForm);

export default class AnswerEditPage extends Component {

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

      if(y) {
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


    console.log(this.state);

    return (
      <Fragment>
        {this.renderEditorHeader()}

        <main className={styles['editor-body']}>
          {
            this.state.file ?
              this.renderFile(this.state.file)
              :
              <CreateFileFormPanel onSubmit={(config) => {
                setTimeout(() => {
                  this.createFile(config);
                });
              }}/>
          }
        </main>
        {
          this.state.file ?
            this.renderEditorRightPanel()
            :
            null
        }
      </Fragment>
    );
  }

  renderEditorHeader = () => {
    const menu = [
      {
        key: 'file', icon: 'mail', title: '文件',
        items: [
          {key: 'new', title: '新建'},
          {key: 'open', title: '打开'},
          {key: 'save', title: '保存', disabled: !this.state.file},
          {key: 'save-as', title: '另存为', disabled: !this.state.file},
          {key: 'print', title: '打印', disabled: !this.state.file},
        ]
      }, {
        key: 'insert', icon: 'appstore', title: '插入', disabled: !this.state.file,
        items: [
          {key: 'page-title', title: '标题'},
          {key: 'student-info', title: '学生信息'},
          {key: 'choice-question', title: '选择题'},
          {key: 'completion-question', title: '填空题'},
          {key: 'answer-question', title: '解答题'}
        ]
      }
    ];
    return (
      <section className={styles['editor-header']}>
        <Menu
          className={styles['edit-menu']}
          onClick={this.handleMenuClick}
          mode="horizontal"
          selectable={false}
        >
          {
            menu.map(sm =>
              <Menu.SubMenu key={sm.key} disabled={sm.disabled}
                            title={<span><Icon type={sm.icon}/><span>{sm.title}</span></span>}>
                {
                  sm.items.map(it =>
                    <Menu.Item key={it.key} disabled={sm.disabled || it.disabled}>{it.title}</Menu.Item>
                  )
                }
              </Menu.SubMenu>
            )
          }
          {/*<Menu.SubMenu key="page" title={<span><Icon type="setting"/><span>纸张</span></span>}>*/}
          {/*{*/}
          {/*Object.entries(PAGE_SIZE).map(([key, size]) =>*/}
          {/*<Menu.Item key={key}>*/}
          {/*{`${key} (${size.print.width}x${size.print.height}mm ${size.direction})`}*/}
          {/*<MenuChecked show={this.state.page.type === key}/>*/}
          {/*</Menu.Item>*/}
          {/*)*/}
          {/*}*/}
          {/*<Menu.Divider/>*/}
          {/*<Menu.Item key="col-1">*/}
          {/*页面不分割*/}
          {/*<MenuChecked show={this.state.page.colsCount === 1}/>*/}
          {/*</Menu.Item>*/}
          {/*<Menu.Item key="col-2">*/}
          {/*页面分割为两列*/}
          {/*<MenuChecked show={this.state.page.colsCount === 2}/>*/}
          {/*</Menu.Item>*/}
          {/*<Menu.Item key="col-3">*/}
          {/*页面分割为三列<MenuChecked show={this.state.page.colsCount === 3}/>*/}
          {/*</Menu.Item>*/}
          {/*</Menu.SubMenu>*/}
        </Menu>
      </section>
    )
  };

  renderEditorRightPanel = () => {
    return (
      <section className={styles['editor-right-panel']}>
        {
          this.state.activeElementKey ?
            <AttributePanel config={this.state.attributePanelConfig || {}} onDelete={() => {
              this.handleDeleteElement();
            }}/>
            :
            null
        }
      </section>
    )
  };

  renderFile = (file) => {
    return (
      <div className={styles['editor-file']}>
        {
          file.pages.map(this.renderPage)
        }
      </div>
    )
  };

  renderPage = (page, pageIndex) => {
    const style = {
      width: page.width,
      height: page.height,
      padding: page.padding.map(it => it + 'px').join(' '),
    };
    const className = classNames(styles['editor-page'], {
      [styles['active']]: this.state.activePageKey === page.key,
    });
    return (
      <div key={page.key} id={page.key} className={className} style={style} onClick={() => {
        this.setState({activePageKey: page.key});
      }}>
        {
          page.cols.map((col, colIndex) => this.renderCol(col, {
            pageKey: page.key,
            pageIndex,
            colIndex,
            colKey: col.key
          }))
        }
        {
          this.state.qrCode && pageIndex === 0 ?
            this.renderQrCode()
            :
            null
        }
      </div>
    )
  };

  renderCol = (col, index) => {
    const props = {
      id: col.key,
      className: classNames(styles['editor-col'], {
        [styles['active']]: this.state.activeColKey === col.key
      }),
      style: {width: col.width, marginLeft: index.colIndex !== 0 ? col.colSpan : 0},
      onClick: () => {
        this.setState({activeColKey: col.key});
      }
    };
    return (
      <div key={col.key} {...props}>
        {
          col.elements.map((ele, elementIndex) => this.renderElement(ele, {
            ...index,
            elementIndex,
            elementKey: ele.key
          }))
        }
      </div>
    )
  };

  renderElement = (ele, index) => {
    const props = {
      index,
      value: ele,
      onChange: () => {
        setTimeout(() => {
          this.setState({...this.state})
        });
      },
      onActive: (ele) => {
        setTimeout(() => {
          this.activeElement(ele.key);
        });
      },
      onFocus: (ele) => {
        setTimeout(() => {
          this.setState({focusKey: ele.key});
        });
      },
      style: {zIndex: index},
      active: ele.key === this.state.activeElementKey,
      focus: ele.key === this.state.focusElementKey,
    };
    return (

      <Fragment key={ele.key}>
        {
          ele.type === 'page-title' ?
            <TitleBox {...props}/>
            :
            ele.type === 'student-info' ?
              <StudentInfoBox {...props}/>
              :
              ele.type === 'choice-question' ?
                <ChoiceQuestionBox {...props}/>
                :
                ele.type === 'completion-question' ?
                  <CompletionBox {...props}/>
                  :
                  ele.type === 'answer-question' ?
                    <AnswerQuestionBox {...props}/>
                    :
                    null
        }
      </Fragment>
    )
  };

  activeElement = (key) => {
    console.log('激活组件', key);
    const state = {activeElementKey: key};
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
