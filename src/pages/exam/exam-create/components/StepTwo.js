import React from 'react'
import { connect } from 'dva';
import { Form, Radio, DatePicker, InputNumber, Checkbox, Row, Col } from 'antd';
import { ExamCreate } from '../../../../utils/namespace'
import { ManagesSteps } from '../utils/namespace'
import { GradeIndexEnum, Enums } from '../../../../utils/Enum';
import moment from 'moment';
import styles from '../index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group
// teachersByGradeIndex
// var res = moment(Date.now(), 'YYYY-MM-DD HH:mm:ss').valueOf();
@connect(state => ({
  teacherList: state[ExamCreate].teacherList,
  twoItem: state[ManagesSteps].twoItem,
  updateTwo: state[ManagesSteps].updateTwo,
  subjectSelectList: state[ManagesSteps].subjectSelectList,
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
    // console.log('onValuesChange: ', values)
    const { form: { getFieldsValue }, dispatch } = props
    const twoItem = getFieldsValue()
    dispatch({
      type: ManagesSteps + '/saveTwoItem',
      payload: {
        twoItem: { ...twoItem, ...values }
      }
    })
  }
})
export default class StepTwo extends React.Component {

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.updateTwo && nextProps.updateTwo !== this.props.updateTwo) {
      console.log('update: updateTwo: ', nextProps.updateTwo);
      const { form: { getFieldsValue, validateFieldsAndScroll }, onCheckSuccess } = this.props
      const item = getFieldsValue();
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          // console.error(errors);
        } else {
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
      type: ManagesSteps + '/setLoading',
      payload: {
        loading: true
      }
    });
    dispatch({
      type: ExamCreate + '/teachersByGradeIndex',
      payload: {
        gradeIndex: e.target.value
      },
      resolve: () => {
        dispatch({
          type: ManagesSteps + '/setLoading',
          payload: {
            loading: false
          }
        });
      },
    })
  }

  handleSubjectDate = (id, name, rule, value, callback) => {
    const { subjectSelectList, twoItem, form: { getFieldsValue } } = this.props;
    const subjectDate = twoItem[`subjectDate${id}`];
    if (subjectDate && subjectDate.startTime && subjectDate.endTime && id && name) {
      const start = subjectDate.startTime.valueOf();
      const end = subjectDate.endTime.valueOf();
      subjectSelectList.forEach(it => {
        if (it.id !== id) {
          const item = getFieldsValue()[`subjectDate${it.id}`]
          if (item && item.startTime && item.endTime) {
            const items = [item.startTime.valueOf(), item.endTime.valueOf()];
            const checkStart = start >= items[0] && start <= items[1];
            const checkEnd = end >= items[0] && end <= items[1];
            if (checkStart || checkEnd) {
              callback(`${name}考试时间与${it.name}考试时间重叠`);
              return;
            }
          }
        }
      });
    }
    callback();
  }

  render() {
    const {
      teacherList = [], subjectSelectList = [],
      form: { getFieldDecorator }
    } = this.props;

    const formlayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
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
                    <DateSelect />
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
                rules: [{ message: '请选择监考老师', required: true }]
              })
                (
                  <CheckboxGroup>
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
      startTime: value.startTime || null,
      time: value.time || 2,
      customTime: value.customTime || null,
      endTime: null
    }
  }

  getEndTime(startTime, time, customTime) {
    let endTime = null;
    if (startTime) {
      if (customTime && customTime > 0) {
        endTime = moment(startTime).add(customTime, 'minutes');
      } else if (time && time > 0) {
        endTime = moment(startTime).add(time, 'hours');
      }
    }
    return endTime;
  }

  handleDateChange = (startTime) => {
    const endTime = this.getEndTime(startTime, this.state.time, this.state.customTime);
    this.setState({ startTime });
    this.triggerChange({ startTime, endTime });
  };

  handleTimeChange = (time) => {
    const endTime = this.getEndTime(this.state.startTime, time.target.value, null);
    const value = {
      time: time.target.value,
      customTime: null,
      endTime
    };
    this.setState(value);
    this.triggerChange(value);
  };

  handleCustomTimeChange = (customTime) => {
    if (customTime && customTime > 0) {
      const endTime = this.getEndTime(this.state.startTime, 0, customTime);
      const value = {
        time: 0,
        customTime,
        endTime
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

  render() {
    const state = this.state;
    return (
      <div className={styles["date-select-container"]}>
        <DatePicker
          value={state.startTime}
          showTime={true}
          format={'YYYY-MM-DD HH:mm'}
          onChange={this.handleDateChange}
        />
        <Radio.Group
          style={{ marginLeft: 20 }}
          onChange={this.handleTimeChange}
          value={state.time}>
          <Radio value={2}>2小时</Radio>
          <Radio value={1.5}>1.5小时</Radio>
        </Radio.Group>
        <span style={{ marginLeft: 10 }}>自定义:</span>
        <InputNumber
          style={{ marginLeft: 6, marginRight: 6 }}
          onChange={this.handleCustomTimeChange}
          defaultValue={0}
          value={state.customTime} />
        <span>分</span>
      </div>
    )
  }
}