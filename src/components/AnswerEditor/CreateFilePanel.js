import React, {Component, Fragment, createRef} from 'react';
import {connect} from 'dva';
import {Form, Checkbox, Button, Menu, Icon, Spin, InputNumber, Select, DatePicker, Cascader} from 'antd';
import classNames from 'classnames';
import uuid from 'uuid/v4';
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
import {AnswerCardTypeEnum, Enums} from "../../utils/Enum";


const Mounted = Symbol('#CreateFilePanel@Mounted');

class CreateFilePanel extends Component {

  state = {
    senior: false,
    maxColCount: 1,
  };

  componentDidMount() {
    const {dispatch, gradeList, subjectList, classMap, gradeMap} = this.props;
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

        dispatch({
          type: namespace + '/set',
          payload: {
            gradeList: Object.values(gradeMap),
            subjectList: subjectList.reverse(),
            classMap,
            gradeMap,
          }
        });

        // this[Mounted] && this.setState({
        //   gradeList: Object.values(gradeMap),
        //   subjectList: subjectList.reverse(),
        //   classMap,
        //   gradeMap,
        // });
      })
    }
  }

  componentWillUnmount() {
    delete this[Mounted];
  }

  render() {

    const {
      dispatch, form: {getFieldDecorator, validateFieldsAndScroll},
      profile, loading, gradeList = [], subjectList = [], classMap = {}, gradeMap = {},
    } = this.props;

    const {senior} = this.state;


    const wrapper = {labelCol: {span: 8}, wrapperCol: {span: 14}};

    const formProps = {
      layout: 'horizontal',
      className: styles['create-file-panel'],
      hideRequiredMark: true,
      onSubmit: (e) => {
        console.log(e);
        e.preventDefault();
        e.stopPropagation();
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

            payload.content.title = `${year}年${profile.schoolName}${klass ? klass.label : grade.label + '年级'}${AnswerCardTypeEnum[payload.info.type]}\n${subject.name}答题卡 (${payload.info.date.format('YYYY.MM.DD')})`;

            console.log(payload, year, grade, klass, subject);

            payload.info.schoolYear = grade.schoolYear;

            dispatch({
              type: namespace + '/createFile',
              payload
            })
          }
        })
      }
    };


    const itemMap = {
      info: {
        date: {
          label: '日期',
          ...wrapper,
          fieldOptions: {
            initialValue: moment(),
            rules: [{required: true, message: '必须填写'}]
          },
          children: (
            <DatePicker locale={locale}/>
          )
        },
        grade: {
          label: '年级/班级',
          ...wrapper,
          fieldOptions: {
            initialValue: [1],
            rules: [{required: true, message: '必须填写'}]
          },
          children: (
            <Cascader style={{width: 150}} options={gradeList} placeholder="请选择年级班级" changeOnSelect/>
          )
        },
        subject: {
          label: '学科',
          ...wrapper,
          fieldOptions: {
            initialValue: subjectList && subjectList.length && subjectList[0].id,
            rules: [{required: true, message: '必须填写'}]
          },
          children: (
            <Select style={{width: 150}} placeholder="请选择学科">
              {
                subjectList.map((subject) =>
                  <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
                )
              }
            </Select>
          )
        },
        type: {
          label: '类型',
          ...wrapper,
          fieldOptions: {
            initialValue: AnswerCardTypeEnum.作业.toString(),
            rules: [{required: true, message: '必须选择'}],
          },
          children: (
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
      },
      content: {
        // title: {
        //   label: '考试或作业名称',
        //   help: '例如：2019年杭州第十四中学康桥校区高一年级暑假作业检测',
        //   ...wrapper,
        //   fieldOptions: {
        //     initialValue: '2019年杭州第十四中学康桥校区高一年级暑假作业检测\n综合答题卡',
        //     rules: [{required: true, message: '必须填写'}]
        //   },
        //   children: <Input.TextArea placeholder="请输入考试或作业名称" autosize={{maxRows: 3, minRows: 1}}/>
        // },
        choiceCount: {
          label: '选择题数量',
          help: '判断题、单选题、多选题统一设置数量',
          ...wrapper,
          fieldOptions: {
            initialValue: 30,
            rules: [{required: true, message: '必须填写'}]
          },
          children: <InputNumber style={{width: 60}} min={0} max={100}/>
        },
        completionCount: {
          label: '填空题数量',
          help: '此项指填空题大题数量，自动生成每大题下3个小题',
          ...wrapper,
          fieldOptions: {
            initialValue: 4,
            rules: [{required: true, message: '必须填写'}]
          },
          children: <InputNumber style={{width: 60}} min={0} max={20}/>
        },
        answerCount: {
          label: '解答题数量',
          help: '需要较大范围用于填写答案的都计为此项',
          ...wrapper,
          fieldOptions: {
            initialValue: 1,
            rules: [{required: true, message: '必须填写'}]
          },
          children: <InputNumber style={{width: 60}} min={0} max={20}/>
        }
      },
      print: {
        type: {
          label: '纸张大小',
          help: '纸张大小设置应于打印时设置一致',
          ...wrapper,
          fieldOptions: {
            initialValue: 'A4',
            rules: [{required: true, message: '必须填写'}]
          },
          children: (
            <Select style={{width: 220}}
                    onChange={(v) => {
                      if(v==='A3' || v==='8K'){
                        this.setState({maxColCount: 3});
                      }else{
                        this.setState({maxColCount: 1});
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
        },
        colCount: {
          label: '纸张分列数量',
          help: 'A4、16K建议1列，8K建议2列',
          ...wrapper,
          fieldOptions: {
            initialValue: 1,
            rules: [{required: true, message: '必须填写'}]
          },
          children: (
            <InputNumber style={{width: 60}} max={this.state.maxColCount || 2} min={1}/>
          )
        },
        dpi: {
          style: {display: senior ? 'block' : 'none'},
          label: '分辨率',
          help: '此项视打印机情况而定，一般为96DPI',
          ...wrapper,
          fieldOptions: {
            initialValue: 96,
            rules: [{required: true, message: '必须填写'}]
          },
          children: (
            <Select style={{width: 90}}>
              {
                [72, 96, 120, 300].map((value) =>
                  <Select.Option key={value} value={value}>{value}</Select.Option>
                )
              }
            </Select>
          )
        },
        padding: {
          style: {display: senior ? 'block' : 'none'},
          label: '纸张边距',
          help: '纸张边缘留白部分，设置后打印机的边距请设置成"无"',
          ...wrapper,
          fieldOptions: {
            initialValue: [80, 60, 80, 60],
            rules: [{required: true, message: '必须填写'}]
          },
          children: <PaddingEditor/>
        },
        colSpan: {
          style: {display: senior ? 'block' : 'none'},
          label: '分列间距',
          help: '列与列有间距',
          ...wrapper,
          fieldOptions: {
            initialValue: 30,
            rules: [{required: true, message: '必须填写'}]
          },
          children: <InputNumber style={{width: 60}} max={100} min={0}/>
        },
      }
    };

    return (
      <Spin spinning={!!loading}>
        <Form {...formProps}>
          {
            Object.entries(itemMap).map(([group, items], index) =>
              <Fragment key={group}>
                {
                  index ?
                    <hr style={{marginBottom: '2em'}}/>
                    :
                    null
                }
                {
                  Object.entries(items).map(([key, {fieldOptions, children, ...itemProps}]) =>
                    <Form.Item key={key} {...itemProps}>
                      {
                        getFieldDecorator(`${group}.${key}`, fieldOptions)(children)
                      }
                    </Form.Item>
                  )
                }
              </Fragment>
            )
          }
          <div style={{paddingLeft:200, marginTop:30}}>
            <a onClick={()=>{
              this.setState({senior: !this.state.senior});
            }}>{this.state.senior ? '简单' : '高级'}</a>
          </div>
          <Form.Item wrapperCol={{offset: 8, span: 14}} style={{marginTop: 50}}>
            <Button type="primary" htmlType="submit" style={{width: 120}}>创建</Button>
            <Button type="danger" htmlType="reset" style={{width: 120, marginLeft: '1em'}} onClick={() => {
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
}))(Form.create({
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
})(CreateFilePanel))