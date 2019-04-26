import React, {Component, Fragment, createRef} from 'react';
import {connect} from 'dva';
import router from 'umi/router';
import {Form, Row, Col, Button, Spin, InputNumber, Select, DatePicker, Cascader, Tabs, Input} from 'antd';
import classNames from 'classnames';
import styles from './answer.less';
import PaddingEditor from "./PaddingEditor";
import {PAGE_SIZE} from "./const";
import {
  AnswerEditor as namespace,
  Authenticate,
  ManagesGrade,
  ManagesClass,
  ManagesSubject
} from "../../utils/namespace";
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import {AnswerCardTypeEnum, EditorContentTypeEnum, Enums} from "../../utils/Enum";


const Mounted = Symbol('#CreateFilePanel@Mounted');

export function ExaminerInfoFields({form: {getFieldDecorator}, gradeList, subjectList, onChange}) {

  const wrapper = {labelCol: {span: 8}, wrapperCol: {span: 14}};

  return (
    <div>
      <Row>
        <Col span={12}>
          <Form.Item {...wrapper} label="日期">
            {
              getFieldDecorator('info.date', {
                initialValue: moment(),
                rules: [{required: true, message: '必须填写'}]
              })(
                <DatePicker locale={locale}/>
              )
            }
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item {...wrapper} label="年级/班级">
            {
              getFieldDecorator('info.grade', {
                initialValue: [1],
                rules: [{required: true, message: '必须填写'}]
              })(
                <Cascader style={{width: 150}} options={gradeList} placeholder="请选择年级班级" changeOnSelect/>
              )
            }
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item {...wrapper} label="学科">
            {
              getFieldDecorator('info.subject', {
                initialValue: subjectList && subjectList.length && subjectList[0].id,
                rules: [{required: true, message: '必须填写'}]
              })(
                <Select style={{width: 150}} placeholder="请选择学科" onChange={subjectId => {
                  if (onChange) {
                    const subject = subjectList.find(it => it.id === subjectId);
                    onChange({subject});
                  }
                }}>
                  {
                    subjectList.map((subject) =>
                      <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item {...wrapper} label="类型">
            {
              getFieldDecorator('info.type', {
                initialValue: AnswerCardTypeEnum.作业.toString(),
                rules: [{required: true, message: '必须填写'}]
              })(
                <Select style={{width: 150}} placeholder="类型" onChange={(v) => {

                }}>
                  {
                    Enums(AnswerCardTypeEnum).map((type) =>
                      <Select.Option key={type.value} value={type.value}>{type.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
        </Col>
      </Row>
    </div>
  )
}

export function CommonQuestionFields({form: {getFieldDecorator}}) {
  const wrapper = {labelCol: {span: 4}, wrapperCol: {span: 14}};
  return (
    <div>
      <Form.Item {...wrapper} label="客观题数量" help="判断题、单选题、多选题统一设置数量">
        {
          getFieldDecorator('content.choiceCount', {
            initialValue: 30,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} min={0} max={100}/>
          )
        }
      </Form.Item>
      <Form.Item {...wrapper} label="填空题数量" help="此项指填空题大题数量，自动生成每大题下3个小题">
        {
          getFieldDecorator('content.completionCount', {
            initialValue: 4,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} min={0} max={20}/>
          )
        }
      </Form.Item>
      <Form.Item {...wrapper} label="解答题数量" help="需要较大范围用于填写答案的都计为此项">
        {
          getFieldDecorator('content.answerCount', {
            initialValue: 1,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} min={0} max={100}/>
          )
        }
      </Form.Item>
    </div>
  )
}

export function EnglishTranslationFields({form: {getFieldDecorator}, onChange, englishTranslation = '', contentType}) {
  let placeholder = '你好吗?\nhow are you?\n你叫什么名字?\nWhat\'s your name?';
  let lines = (englishTranslation || '').split(/\n/g);

  return (
    <div>
      <h3>按行输入，一行题目，一行答案， <strong>共{englishTranslation ? lines.length : 0}行，{Math.floor(lines.length / 2)}题</strong>
      </h3>
      <Form.Item>
        {
          getFieldDecorator('content.englishTranslation', {
            initialValue: '',
            rules: [{
              validator: (rule, value, callback) => {
                const list = value.split(/\n/g);
                if (contentType * 1 !== EditorContentTypeEnum.英语翻译答题卡 || list.length % 2 === 0) {
                  callback();
                } else {
                  callback(new Error('请按一行题目，一行答案的格式输入'));
                }
              }
            }]
          })(
            <Input.TextArea
              autosize={{minRows: 16, maxRows: 30}}
              placeholder={placeholder}
              onChange={e => {
                onChange && onChange({englishTranslation: e.target.value});
              }}/>
          )
        }
      </Form.Item>
    </div>
  )
}




export function PrintFields({form: {getFieldDecorator}, onChange, maxColCount, senior}) {
  const wrapper = {labelCol: {span: 4}, wrapperCol: {span: 14}};
  return (
    <div>
      <Form.Item {...wrapper} label="纸张大小" help="纸张大小设置应于打印时设置一致">
        {
          getFieldDecorator('print.type', {
            initialValue: 'A4',
            rules: [{required: true, message: '必须填写'}]
          })(
            <Select style={{width: 220}}
                    onChange={(v) => {
                      if (v === 'A3' || v === '8K') {
                        onChange({maxColCount: 3});
                      } else {
                        onChange({maxColCount: 1});
                      }
                    }}
            >
              {
                Object.entries(PAGE_SIZE).map(([key, page]) =>
                  <Select.Option key={key} value={key}>
                    {`${key} (${page.print.width}x${page.print.height}mm ${page.direction})`}
                  </Select.Option>
                )
              }
            </Select>
          )
        }
      </Form.Item>
      <Form.Item {...wrapper} label="纸张分列数量" help="A4、16K建议1列，8K建议2列">
        {
          getFieldDecorator('print.colCount', {
            initialValue: 1,
            rules: [{required: true, message: '必须填写'}]
          })(
            <InputNumber style={{width: 60}} max={maxColCount || 2} min={1}/>
          )
        }
      </Form.Item>
      {
        <div style={{display: senior ? 'block' : 'none'}}>
          <Form.Item {...wrapper} label="分辨率" help="此项视打印机情况而定，一般为96DPI">
            {
              getFieldDecorator('print.dpi', {
                initialValue: 96,
                rules: [{required: true, message: '必须填写'}]
              })(
                <Select style={{width: 90}}>
                  {
                    [72, 96, 120, 300].map((value) =>
                      <Select.Option key={value} value={value}>{value}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item {...wrapper} label="纸张边距" help="纸张边缘留白部分，设置后打印机的边距请设置成“无”">
            {
              getFieldDecorator('print.padding', {
                initialValue: [80, 60, 80, 60],
                rules: [{required: true, message: '必须填写'}]
              })(
                <PaddingEditor/>
              )
            }
          </Form.Item>
          <Form.Item {...wrapper} label="分列间距" help="列与列的间距">
            {
              getFieldDecorator('print.colSpan', {
                initialValue: 30,
                rules: [{required: true, message: '必须填写'}]
              })(
                <InputNumber style={{width: 60}} max={100} min={0}/>
              )
            }
          </Form.Item>
        </div>
      }
      <div style={{paddingLeft: 100, marginTop: 30}}>
        <a onClick={() => {
          onChange && onChange({senior: !senior});
        }}>{senior ? '简单' : '高级设置'}</a>
      </div>
    </div>
  )
}

class CreateFilePanel extends Component {

  state = {
    senior: false,
    maxColCount: 1,
    contentType: EditorContentTypeEnum.通用答题卡,
  };

  componentDidMount() {
    const {dispatch, gradeList, subjectList, classMap, gradeMap, createFilePayload} = this.props;
    this[Mounted] = true;
    if (!gradeList || !subjectList || !classMap || !gradeMap) {
      Promise.all([
        new Promise((resolve, reject) => {
          dispatch({
            type: ManagesGrade + '/list',
            payload: {
              s: 1000
            },
            resolve,
            reject
          })
        }),
        new Promise((resolve, reject) => {
          dispatch({
            type: ManagesClass + '/list',
            payload: {
              s: 10000,
              simple: 1
            },
            resolve,
            reject
          })
        }),
        new Promise((resolve, reject) => {
          dispatch({
            type: ManagesSubject + '/list',
            payload: {
              s: 10000
            },
            resolve,
            reject
          })
        }),
      ]).then(([gradeModel, classModel, subjectModel]) => {
        const gradeList = gradeModel.list || [];
        const classList = classModel.list || [];
        const subjectList = subjectModel.list || [];

        const gradeMap = gradeList.reduce((map, {id, name, schoolYear}) => {
          map[id] = {value: id, label: name, schoolYear, children: []};
          return map;
        }, {});

        const classMap = classList.reduce((map, {id, name, gradeId}) => {
          const grade = gradeMap[gradeId];
          const klass = {value: id, label: name, gradeId};
          grade.children.push(klass);
          map[id] = klass;
          return map;
        }, {});

        if (subjectList && createFilePayload && createFilePayload.info && createFilePayload.info.subject) {
          const subject = subjectList.find(it => it.id === createFilePayload.info.subject);
          this.setState({subject});
        }

        dispatch({
          type: namespace + '/set',
          payload: {
            gradeList: Object.values(gradeMap),
            subjectList: subjectList.reverse(),
            classMap,
            gradeMap,
          }
        });
      })
    }
    console.log(createFilePayload);

    if (subjectList && createFilePayload && createFilePayload.info && createFilePayload.info.subject) {
      const subject = subjectList.find(it => it.id === createFilePayload.info.subject);
      this.setState({subject});
    }
    if (createFilePayload && createFilePayload.content && createFilePayload.content.type) {
      this.setState({contentType: createFilePayload.content.type});
    }

  }

  componentWillUnmount() {
    delete this[Mounted];
  }

  handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    const {
      form: {validateFieldsAndScroll}, dispatch,
      profile, subjectList = [], classMap = {}, gradeMap = {},
    } = this.props;

    validateFieldsAndScroll((errors, payload) => {
      if (errors) {
        console.error(errors);
      } else {
        const year = payload.info.date.year();
        const grade = gradeMap[payload.info.grade[0]];
        const klass = classMap[payload.info.grade[1]];
        const subjectMap = subjectList.reduce((map, it) => {
          map[it.id] = it;
          return map;
        }, {});
        const subject = subjectMap[payload.info.subject];
        const {schoolName} = profile;

        payload.content.title = `${year}年${schoolName}${klass ? klass.label : grade.label + '年级'}${AnswerCardTypeEnum[payload.info.type]}\n${subject.name}答题卡 (${payload.info.date.format('YYYY.MM.DD')})`;

        payload.content.type = this.state.contentType;

        if (payload.content.type * 1 === EditorContentTypeEnum.英语翻译答题卡) {
          payload.print.colCount = 2;
        }

        payload.info.schoolYear = grade.schoolYear;

        console.log(payload);

        dispatch({
          type: namespace + '/createFile',
          payload
        });

        router.push('/examiner/editor');

      }
    })
  };

  render() {

    const {
      dispatch, form, loading, gradeList = [], subjectList = [],
    } = this.props;

    const formProps = {
      layout: 'horizontal',
      className: styles['create-file-panel'],
      hideRequiredMark: true,
      onSubmit: this.handleSubmit
    };
    const onChange = state => this.setState(state);
    const infoFieldsProps = {
      form, gradeList, subjectList,
      onChange
    };

    const printFieldsProps = {
      form, ...this.state,
      onChange
    };

    const englishTranslationFields = {
      form, ...this.state, onChange,
    };
    console.log(this.state);

    return (
      <Spin spinning={!!loading}>
        <Form {...formProps}>
          <Tabs defaultActiveKey="info">
            <Tabs.TabPane tab="基本信息" key="info">
              <ExaminerInfoFields {...infoFieldsProps}/>
            </Tabs.TabPane>
          </Tabs>
          <Tabs activeKey={this.state.contentType.toString()} onChange={type => this.setState({contentType: type})}>
            <Tabs.TabPane tab="通用答题卡" key={EditorContentTypeEnum.通用答题卡}>
              <CommonQuestionFields form={form}/>
            </Tabs.TabPane>
            {
              this.state.subject && this.state.subject.name === '英语' ?
                <Tabs.TabPane tab="英语翻译答题卡" key={EditorContentTypeEnum.英语翻译答题卡}>
                  <EnglishTranslationFields {...englishTranslationFields}/>
                </Tabs.TabPane>
                :
                null
            }
          </Tabs>
          <Tabs defaultActiveKey="print">
            <Tabs.TabPane tab="页面设置" key="print">
              <PrintFields {...printFieldsProps} />
            </Tabs.TabPane>
          </Tabs>


          <Form.Item wrapperCol={{offset: 4, span: 14}} style={{marginTop: 50}}>
            <Button type="primary" htmlType="submit" style={{width: 100}}>创建</Button>
            <Button type="danger" htmlType="reset" style={{width: 100, marginLeft: '1em'}} onClick={() => {
              dispatch({
                type: namespace + '/set',
                payload: {
                  createFilePayload: null

                }
              })
            }}>重置</Button>
          </Form.Item>
        </Form>
      </Spin>
    );
  }
}

export default connect(state => ({
  profile: state[Authenticate].authenticate,
  loading: state[ManagesGrade].loading || state[ManagesClass].loading || state[ManagesSubject].loading,
  gradeList: state[namespace].gradeList,
  subjectList: state[namespace].subjectList,
  classMap: state[namespace].classMap,
  gradeMap: state[namespace].gradeMap,
  createFilePayload: state[namespace].createFilePayload,
}))(
  Form.create({
      mapPropsToFields(props) {
        const ret = {};
        if (props.createFilePayload) {
          Object.entries(props.createFilePayload).forEach(([key, group]) => {
            if (group) {
              Object.entries(group).forEach(([subKey, value]) => {
                ret[`${key}.${subKey}`] = Form.createFormField({value});
              });
            }
          })
        }
        delete ret['info.date'];
        console.log(ret);
        return ret;
      }
    }
  )(CreateFilePanel)
)

