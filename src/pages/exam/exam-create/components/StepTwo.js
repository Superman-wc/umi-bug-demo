import React, {Component} from 'react';
import {connect} from 'dva';
import {Form, Button, Radio, DatePicker, TimePicker, InputNumber, Tree} from 'antd';
import {ExamCreate, ManagesGrade} from '../../../../utils/namespace';
import {ManagesSteps} from '../utils/namespace';
import {GradeIndexEnum, Enums} from '../../../../utils/Enum';
import moment from 'moment';
import styles from '../index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@connect(state => ({
  teacherList: state[ExamCreate].teacherList,
  twoItem: state[ManagesSteps].twoItem,
  oneItem: state[ManagesSteps].oneItem,
  updateTwo: state[ManagesSteps].updateTwo,
  subjectSelectList: state[ManagesSteps].subjectSelectList,
  needRoomNum: state[ManagesSteps].needRoomNum,
  gradeList: state[ManagesGrade].list,
}))
@Form.create({
  mapPropsToFields(props) {
    const twoItem = props.twoItem || {};
    const {gradeTeacherIndex, teacherId} = twoItem;
    const {subjectSelectList = []} = props;
    const subjectFields = {};
    subjectSelectList.forEach(it => {
      subjectFields[`subjectDate${it.id}`] =
        Form.createFormField({value: twoItem[`subjectDate${it.id}`] || undefined});
    });
    return {
      ...subjectFields,
      gradeTeacherIndex: Form.createFormField({value: gradeTeacherIndex || undefined}),
      teacherId: Form.createFormField({value: teacherId || undefined}),
    }
  },
  onValuesChange(props, values) {
    const {form: {getFieldsValue}, dispatch} = props;
    const twoItem = getFieldsValue();
    dispatch({
      type: ManagesSteps + '/saveTwoItem',
      payload: {
        twoItem: {...twoItem, ...values}
      }
    });
  }
})
export default class StepTwo extends Component {

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.updateTwo && nextProps.updateTwo !== this.props.updateTwo) {
      const {form: {getFieldsValue, validateFieldsAndScroll}, onCheckSuccess} = this.props;
      const item = getFieldsValue();
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          console.error(errors);
        } else {
          console.log('twoItem: ', payload);
          const {subjectSelectList, dispatch} = this.props;
          const dateSelectList = [];
          subjectSelectList.forEach(it => {
            it.dateSelect = item[`subjectDate${it.id}`];
            dateSelectList.push(it);
          });

          dispatch({
            type: ManagesSteps + '/saveDateSelectList',
            payload: {
              dateSelectList
            }
          });

          onCheckSuccess();
        }
      })
    }
  }

  onGradeDataChange = (e) => {
    const {dispatch} = this.props;
    dispatch({
      type: ExamCreate + '/getTeacher',
      payload: {
        gradeIndex: e.target.value
      },
    });
  };

  handleSubjectDate = (id, name, rule, value, callback) => {
    const {subjectSelectList, form: {getFieldsValue}} = this.props;
    // const subjectDate = twoItem[`subjectDate${id}`];
    const subjectDate = value;
    if (subjectDate && subjectDate.startDateTime && subjectDate.endDateTime && id && name) {
      const start = subjectDate.startDateTime.valueOf();
      const end = subjectDate.endDateTime.valueOf();
      subjectSelectList.some(it => {
        if (it.id !== id) {
          const item = getFieldsValue()[`subjectDate${it.id}`];
          if (item && item.startDateTime && item.endDateTime) {
            const items = [item.startDateTime.valueOf(), item.endDateTime.valueOf()];
            const checkStart = start >= items[0] && start <= items[1];
            const checkEnd = end >= items[0] && end <= items[1];
            if (checkStart || checkEnd) {
              callback(`${name}考试时间与${it.name}考试时间重叠`);
              return true;
            }
          }
        }
      });
      callback();
    } else {
      callback('请选择考试时间');
    }
  };

  handleTeacher = (rule, value, callback) => {
    if (value) {
      const {needRoomNum, oneItem: {monitorNum}} = this.props;
      const needNum = monitorNum * needRoomNum;
      const currentNum = value.teacherIds.length;
      if (currentNum < needNum) {
        callback(`监考老师数量过少, 当前${currentNum}, 需要${needNum}位`);
        return;
      }
    }
    callback();
  };

  render() {
    const {
      teacherList = [], subjectSelectList = [], needRoomNum = 0,
      gradeList=[],
      oneItem: {examDate, monitorNum}, twoItem: {gradeTeacherIndex},
      form: {getFieldDecorator}
    } = this.props;

    const needTeacherNum = monitorNum * needRoomNum;

    const subjectMap  = teacherList.reduce((map, it) => {
      if (!map[it.subjectId]) {
        map[it.subjectId] = {id: it.subjectId, name: it.subjectName, children: []};
      }
      map[it.subjectId].children.push(it);
      return map;
    }, {});
    const subjectList = Object.values(subjectMap);

    const formLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 20},
    };

    return (
      <div>
        <Form {...formLayout} layout='horizontal'>
          {
            subjectSelectList.map(it =>
              <FormItem key={it.id} label={`${it.name}考试时间`}>
                {
                  getFieldDecorator(`subjectDate${it.id}`, {
                    rules: [
                      {message: `请选择${it.name}考试时间`, required: true},
                      {validator: this.handleSubjectDate.bind(null, it.id, it.name)}
                    ]
                  })(
                    <DateSelect examDate={examDate}/>
                  )
                }
              </FormItem>
            )
          }
          <FormItem label="监考老师年级">
            {
              getFieldDecorator('gradeTeacherIndex', {
                rules: [{message: '请选择年级', required: true}],
              })(
                <RadioGroup onChange={this.onGradeDataChange}>
                  {
                    gradeList.map(it =>
                      <Radio.Button key={it.id} value={it.gradeIndex}>{it.name}</Radio.Button>
                    )
                  }
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem label="选择监考老师">
            {getFieldDecorator('teacherId', {
              rules: [
                {message: '选择监考老师', required: true},
                {validator: this.handleTeacher}
              ]
            })(
              <TeacherTree
                gradeTeacherIndex={gradeTeacherIndex}
                needTeacherNum={needTeacherNum}
                data={subjectList}/>
            )}
          </FormItem>
        </Form>
      </div>
    )
  }
}

/**
 * 科目考试时间控件
 */

class DateSelect extends Component {

  constructor(props) {
    super(props);
    const value = props.value || {};
    this.state = {
      openTime: false,
      startDateTime: value.startDateTime || null,
      endDateTime: value.endDateTime || null,
      startDate: value.startDate || null,
      startTime: value.startTime || null,
      timeStep: value.timeStep || 2,
      customTimeStep: value.customTimeStep || null,
    }
  }

  getEndDateTime(startDateTime, timeStep, customTimeStep) {
    let endDateTime = null;
    if (startDateTime) {
      if (customTimeStep && customTimeStep > 0) {
        endDateTime = moment(startDateTime).add(customTimeStep, 'minutes');
      } else if (timeStep && timeStep > 0) {
        endDateTime = moment(startDateTime).add(timeStep, 'hours');
      }
    }
    return endDateTime;
  }

  // 日期
  handleStartDateChange = (startDate) => {
    let startDateNew = null;
    let startDateTime = null;
    if (startDate) {
      startDateNew = startDate.startOf('day');
      if (this.state.startTime) {
        startDateTime = moment(startDateNew)
          .add(this.state.startTime.hours(), 'hours')
          .add(this.state.startTime.minutes(), 'minutes');
      }
    }
    const endDateTime = this.getEndDateTime(startDateTime, this.state.timeStep, this.state.customTimeStep);
    const value = {
      startDateTime,
      endDateTime,
      startDate: startDateNew,
    };
    this.setState(value);
    this.triggerChange(value);
  };

  // 时间
  handleStartTimeChange = (startTime) => {
    let startDateTime = null;
    if (startTime && this.state.startDate) {
      startDateTime = moment(this.state.startDate)
        .add(startTime.hours(), 'hours')
        .add(startTime.minutes(), 'minutes');
    }
    const endDateTime = this.getEndDateTime(startDateTime, this.state.timeStep, this.state.customTimeStep);
    const value = {
      startDateTime,
      endDateTime,
      startTime,
    };
    this.setState(value);
    this.triggerChange(value);
  };

  // 时间间隔
  handleTimeStepChange = (timeStep) => {
    const endDateTime = this.getEndDateTime(this.state.startDateTime, timeStep.target.value, null);
    const value = {
      endDateTime,
      customTimeStep: null,
      timeStep: timeStep.target.value,
    };
    this.setState(value);
    this.triggerChange(value);
  };

  // 自定义时间
  handleCustomTimeStepChange = (customTimeStep) => {
    if (customTimeStep && customTimeStep > 0) {
      const endDateTime = this.getEndDateTime(this.state.startDateTime, 0, customTimeStep);
      const value = {
        timeStep: 0,
        customTimeStep,
        endDateTime,
      };
      this.setState(value);
      this.triggerChange(value);
    }
  };

  triggerChange = (changeValue) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changeValue));
    }
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({openTime: true});
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({openTime: open});
  };

  handleClose = () => this.setState({openTime: false});

  disabledDate = (current) => {
    const {examDate} = this.props;
    return (current && current < examDate[0].startOf('day') ||
      current < moment().startOf('day') ||
      current > examDate[1].endOf('day'));
  };

  render() {
    const state = this.state;
    return (
      <div className={styles["date-select-container"]}>
        <DatePicker
          value={state.startDate}
          showTime={false}
          format={'YYYY-MM-DD'}
          onChange={this.handleStartDateChange}
          onOpenChange={this.handleStartOpenChange}
          disabledDate={this.disabledDate}
        />
        <TimePicker
          style={{marginLeft: 5}}
          minuteStep={5}
          value={state.startTime}
          open={state.openTime}
          onOpenChange={this.handleEndOpenChange}
          onChange={this.handleStartTimeChange}
          format={'HH:mm'}
          addon={() => (
            <Button size="small" type="primary" onClick={this.handleClose}>
              确定
            </Button>
          )}
        />
        <Radio.Group
          style={{marginLeft: 20}}
          onChange={this.handleTimeStepChange}
          value={state.timeStep}>
          <Radio value={2.5}>2.5小时</Radio>
          <Radio value={2}>2小时</Radio>
          <Radio value={1.5}>1.5小时</Radio>
        </Radio.Group>
        <span style={{marginLeft: 10}}>自定义:</span>
        <InputNumber
          style={{marginLeft: 5, marginRight: 5}}
          onChange={this.handleCustomTimeStepChange}
          defaultValue={0}
          value={state.customTimeStep}/>
        <span>分钟</span>
      </div>
    )
  }
}


class TeacherTree extends Component {

  handleTeacherId = (checkedKeys, e) => {
    // console.log('checkedKeys: ', checkedKeys, e);
    const key = e.node.props.eventKey;
    const checked = e.checked;
    const {onChange, value = {}, data} = this.props;
    const {teacherIds = []} = value;
    const index = teacherIds.findIndex(id => {
      return id === key;
    });
    if (checked) {
      if (key.charAt(0) === 'g') {
        const array = key.split('-');
        const subjectId = array[1];
        const subjectIndex = data.findIndex(subject => {
          return subject.id * 1 === subjectId * 1;
        });
        // console.log('subjectIndex: ', subjectIndex, subjectId, array);
        data[subjectIndex].children.forEach(teacher => {
          const teacherIndex = teacherIds.findIndex(teacherId => {
            return teacherId * 1 === teacher.id * 1;
          });
          if (teacherIndex === -1) {
            teacherIds.push(teacher.id + '');
          }
        })
      } else {
        if (index === -1) {
          teacherIds.push(key);
        }
      }
    } else {// 取消选中
      if (key.charAt(0) === 'g') {
        const array = key.split('-');
        const subjectId = array[1];
        const subjectIndex = data.findIndex(subject => {
          return subject.id * 1 === subjectId * 1;
        });
        // console.log('subjectIndex: ', subjectIndex, subjectId, array);
        data[subjectIndex].children.forEach(teacher => {
          const teacherIndex = teacherIds.findIndex(teacherId => {
            return teacherId * 1 === teacher.id * 1;
          });
          if (teacherIndex !== -1) {
            teacherIds.splice(teacherIndex, 1);
          }
        })
      } else {
        if (index !== -1) {
          teacherIds.splice(index, 1);
        }
      }
    }
    // console.log('teacherIds: ', teacherIds);
    onChange({teacherIds});
  };

  renderTreeNodes = (gradeTeacherIndex, data) => data.map(subject => {
    return (
      <Tree.TreeNode
        className={styles["tree-container"]}
        title={subject.name}
        key={`g${gradeTeacherIndex}-${subject.id}`}>
        {
          subject.children.map(teacher => {
            return (
              <Tree.TreeNode
                key={teacher.id}
                title={teacher.name}/>
            )
          })
        }
      </Tree.TreeNode>
    )
  });

  render() {
    const {gradeTeacherIndex, needTeacherNum, data, value = {}} = this.props;
    const {teacherIds = []} = value;

    // 当前年级去除无用的id,保证当前的teacherIds都在tree的节点中
    const currentTeacherIds = [];
    for (let subject of data) {
      for (let teacher of subject.children) {
        const index = teacherIds.findIndex(id => {
          return id * 1 === teacher.id * 1;
        });
        const currentIndex = currentTeacherIds.findIndex(id => {
          return id * 1 === teacher.id * 1;
        });
        if (index !== -1 && currentIndex === -1) {
          currentTeacherIds.push(teacher.id + '');
        }
      }
    }

    return (
      <div>
        <div>
          <span className={styles['room-select']}>
            至少需要{needTeacherNum}位监考教师
          </span>
          {
            currentTeacherIds && currentTeacherIds.length ?
              <span>，已选择{currentTeacherIds.length}位教师</span>
              :
              null
          }
        </div>
        {
          data && data.length > 0 && gradeTeacherIndex &&
          <div>
            {
              gradeTeacherIndex * 1 === 10 &&
              <Tree
                checkable
                onCheck={this.handleTeacherId}
                checkedKeys={currentTeacherIds}
                defaultExpandAll={true}>
                {this.renderTreeNodes(gradeTeacherIndex, data)}
              </Tree>
            }
            {
              gradeTeacherIndex * 1 === 11 &&
              <Tree
                checkable
                onCheck={this.handleTeacherId}
                checkedKeys={currentTeacherIds}
                defaultExpandAll={true}>
                {this.renderTreeNodes(gradeTeacherIndex, data)}
              </Tree>
            }
            {
              gradeTeacherIndex * 1 === 12 &&
              <Tree
                checkable
                onCheck={this.handleTeacherId}
                checkedKeys={currentTeacherIds}
                defaultExpandAll={true}>
                {this.renderTreeNodes(gradeTeacherIndex, data)}
              </Tree>
            }
          </div>
        }
      </div>
    )
  }
}
