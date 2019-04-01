import React from 'react';
import { connect } from 'dva';
import { Form, Button, Radio, DatePicker, TimePicker, InputNumber, Checkbox, Row, Col } from 'antd';
import { ExamCreate } from '../../../../utils/namespace';
import { ManagesSteps } from '../utils/namespace';
import { GradeIndexEnum, Enums } from '../../../../utils/Enum';
import moment from 'moment';
import styles from '../index.less';

const FormItem = Form.Item
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
@connect(state => ({
  teacherList: state[ExamCreate].teacherList,
  twoItem: state[ManagesSteps].twoItem,
  oneItem: state[ManagesSteps].oneItem,
  updateTwo: state[ManagesSteps].updateTwo,
  subjectSelectList: state[ManagesSteps].subjectSelectList,
  needRoomNum: state[ManagesSteps].needRoomNum,
}))
@Form.create({
  mapPropsToFields(props) {
    const twoItem = props.twoItem || {};
    const { gradeTeacherIndex, teacherIds } = twoItem;
    const { subjectSelectList = [] } = props;
    const subjectFields = {};
    subjectSelectList.forEach(it => {
      subjectFields[`subjectDate${it.id}`] =
        Form.createFormField({ value: twoItem[`subjectDate${it.id}`] || undefined });
    })
    return {
      ...subjectFields,
      gradeTeacherIndex: Form.createFormField({ value: gradeTeacherIndex || undefined }),
      teacherIds: Form.createFormField({ value: teacherIds || undefined }),
    }
  },
  onValuesChange(props, values) {
    const { form: { getFieldsValue }, dispatch } = props;
    const twoItem = getFieldsValue();
    dispatch({
      type: ManagesSteps + '/saveTwoItem',
      payload: {
        twoItem: { ...twoItem, ...values }
      }
    });
  }
})
export default class StepTwo extends React.Component {

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.updateTwo && nextProps.updateTwo !== this.props.updateTwo) {
      const { form: { getFieldsValue, validateFieldsAndScroll }, onCheckSuccess } = this.props;
      const item = getFieldsValue();
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          // console.error(errors);
        } else {
          console.log('stepTwo: ', payload);
          const { subjectSelectList, dispatch } = this.props;
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
    const { dispatch } = this.props;
    dispatch({
      type: ExamCreate + '/teachersByGradeIndex',
      payload: {
        gradeIndex: e.target.value
      },
    });
  };

  handleSubjectDate = (id, name, rule, value, callback) => {
    const { subjectSelectList, form: { getFieldsValue } } = this.props;
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
    // console.log('handleTeacher: ', value);
    if (value) {
      const { needRoomNum, oneItem: { monitorNum, roomId: { roomIds } } } = this.props;
      const needNum = monitorNum * needRoomNum;
      const currentNum = value.length;
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
      oneItem: { examDate, monitorNum, roomId: { roomIds } },
      form: { getFieldDecorator }
    } = this.props;
    const needTeacherNum = monitorNum * needRoomNum;

    const formlayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    return (
      <div>
        <Form {...formlayout} layout='horizontal'>
          {
            subjectSelectList.map(it =>
              <FormItem key={it.id} label={`${it.name}考试时间`} >
                {
                  getFieldDecorator(`subjectDate${it.id}`, {
                    rules: [
                      { message: `请选择${it.name}考试时间`, required: true },
                      { validator: this.handleSubjectDate.bind(null, it.id, it.name) }
                    ]
                  })(
                    <DateSelect examDate={examDate} />
                  )
                }
              </FormItem>
            )
          }
          <FormItem label="监考老师年级">
            {
              getFieldDecorator('gradeTeacherIndex', {
                rules: [{ message: '请选择年级', required: true }],
              })(
                <RadioGroup onChange={this.onGradeDataChange}>
                  {
                    Enums(GradeIndexEnum).map(it =>
                      <Radio.Button key={it.value} value={it.value}>{it.name}</Radio.Button>
                    )
                  }
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem label='选择监考老师'>
            {
              getFieldDecorator('teacherIds', {
                rules: [
                  { message: '请选择监考老师', required: true },
                  { validator: this.handleTeacher }
                ]
              })
                (
                  <CheckboxGroup>
                    <div>
                      <span className={styles['teacher-select']}>
                        至少需要{needTeacherNum}个老师</span>
                    </div>
                    <Row>
                      {
                        teacherList.map(it =>
                          <Col key={it.id} span={4} style={{ height: 40 }}>
                            <Checkbox value={it.id}>{it.name}</Checkbox>
                          </Col>
                        )
                      }
                    </Row>
                  </CheckboxGroup>
                )
            }
          </FormItem>
        </Form>
        <div style={{ height: 80 }}></div>
      </div>
    )
  }
}

/**
 * 科目考试时间控件
 */

class DateSelect extends React.Component {

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
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changeValue));
    }
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ openTime: true });
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({ openTime: open });
  };

  handleClose = () => this.setState({ openTime: false });

  disabledDate = (current) => {
    const { examDate } = this.props;
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
          style={{ marginLeft: 5 }}
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
          style={{ marginLeft: 20 }}
          onChange={this.handleTimeStepChange}
          value={state.timeStep}>
          <Radio value={2.5}>2.5小时</Radio>
          <Radio value={2}>2小时</Radio>
          <Radio value={1.5}>1.5小时</Radio>
        </Radio.Group>
        <span style={{ marginLeft: 10 }}>自定义:</span>
        <InputNumber
          style={{ marginLeft: 5, marginRight: 5 }}
          onChange={this.handleCustomTimeStepChange}
          defaultValue={0}
          value={state.customTimeStep} />
        <span>分</span>
      </div>
    )
  }
}