import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Radio, DatePicker, InputNumber, Select, Checkbox, Row, Col, notification } from 'antd';
import { ExamCreate } from '../../../../utils/namespace';
import { ManagesSteps } from '../utils/namespace';
import { ExamTypeEnum, GradeIndexEnum, Enums } from '../../../../utils/Enum';
import styles from '../index.less';
import moment from 'moment';

const FormItem = Form.Item
const RadioGroup = Radio.Group;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group
@connect(state => ({
  subjectList: state[ExamCreate].subjectList,
  doorPlateList: state[ExamCreate].doorPlateList,
  oneItem: state[ManagesSteps].oneItem,
  updateOne: state[ManagesSteps].updateOne,
  studentNum: state[ManagesSteps].studentNum
}))
@Form.create({
  mapPropsToFields(props) {
    const {
      examDate, examType, gradeIndex, row, col, monitorNum, subjectIds,
      roomIds
    } = props.oneItem || {};
    return {
      examType: Form.createFormField({ value: examType || undefined }),
      gradeIndex: Form.createFormField({ value: gradeIndex || undefined }),
      examDate: Form.createFormField({ value: examDate || undefined }),
      rowCol: Form.createFormField({ value: row && col && [row, col] || undefined }),
      monitorNum: Form.createFormField({ value: monitorNum || undefined }),
      subjectIds: Form.createFormField({ value: subjectIds || undefined }),
      roomIds: Form.createFormField({ value: roomIds || undefined }),
    }
  },
  onValuesChange(props, values) {
    const { form: { getFieldsValue }, dispatch } = props
    let item = getFieldsValue()
    const rowItem = item['rowCol']
    if (values['rowCol']) {
      const propsItem = props.oneItem || {}
      const row = values['rowCol'][0] || propsItem.row
      const col = values['rowCol'][1] || propsItem.col
      values = { rowCol: [row, col], row, col };
    } else if (rowItem) {
      [item.row, item.col] = rowItem
    }
    if (values['gradeIndex']) {
      item['subjectIds'] = [];
    }
    // console.log('item', item)
    dispatch({
      type: ManagesSteps + '/saveOneItem',
      payload: {
        oneItem: { ...item, ...values }
      }
    })
  }
})
export default class StepOne extends React.Component {

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.updateOne && nextProps.updateOne !== this.props.updateOne) {
      // console.log('update: updateOne: ', nextProps.updateOne);
      const { form: { getFieldsValue, validateFieldsAndScroll }, onCheckSuccess } = this.props
      const item = getFieldsValue()
      // console.log('getFieldsValue: ', item);
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          console.error(errors);
          if (errors['roomIds']) {
            notification.warning({ message: '考场数量过少' });
          }
        } else {
          // console.log('payload: ', payload);
          const { subjectIds = [], roomIds = [] } = item;
          const { subjectList, doorPlateList, dispatch } = this.props;

          const subjectSelectList = [];
          subjectList.forEach(it => {
            if (subjectIds.indexOf(it.id) !== -1) {
              subjectSelectList.push(it);
            }
          });

          const roomSelectList = [];
          doorPlateList.forEach(it => {
            if (roomIds.indexOf(it.id) !== -1) {
              roomSelectList.push(it);
            }
          });

          dispatch({
            type: ManagesSteps + '/saveSubjectSelectList',
            payload: {
              subjectSelectList
            }
          });

          dispatch({
            type: ManagesSteps + '/saveRoomSelectList',
            payload: {
              roomSelectList
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
      type: ExamCreate + '/listSubject',
      payload: {
        gradeIndex: e.target.value
      },
      resolve: () => {
        dispatch({
          type: ManagesSteps + '/saveStudentNum',
          payload: {
            studentNum: 0
          }
        })
      }
    })
  };

  onSubjectChange = (value) => {
    const { subjectList, dispatch } = this.props;
    const totals = [0];
    value.forEach(it => {
      const subject = subjectList.find(value => value.id == it);
      if (subject) {
        totals.push(subject.studentNum);
      }
    })
    const max = Math.max(...totals);
    // console.log('onSubjectChange-max: ', max);
    dispatch({
      type: ManagesSteps + '/saveStudentNum',
      payload: {
        studentNum: max
      }
    })
  };

  // 选择的人数需大于考试科目最大数
  handleRoom = (rule, value, callback) => {
    const { studentNum, oneItem: { row, col, monitorNum } } = this.props;
    if (value && row && col && monitorNum) {
      const length = value.length;
      // console.log('length: ', length, row, col, monitorNum);
      const total = row * col * length;
      if (studentNum > total) {
        callback('考场数量过少');
        return;
      }
    }
    callback();
  };

  disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().startOf('day');
  };

  render() {
    const {
      subjectList = [], doorPlateList = [], studentNum = 0,
      form: { getFieldDecorator }
    } = this.props;

    const formlayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };

    const roomTotal = doorPlateList.length;

    const buildingMap = {};
    const layerMap = {};
    doorPlateList.reduce((map, it) => {
      if (!buildingMap[it.buildingId]) {
        buildingMap[it.buildingId] = { id: it.buildingId, name: it.buildingName, children: [] };
      }
      if (!layerMap[it.layerId]) {
        layerMap[it.layerId] = { id: it.layerId, name: it.layerName, children: [] };
        buildingMap[it.buildingId].children.push(layerMap[it.layerId]);
      }
      layerMap[it.layerId].children.push(it);
      map[it.id] = it;
      return map;
    }, {});
    const buildingList = Object.values(buildingMap);
    return (
      <div>
        <Form {...formlayout} layout='horizontal'>
          <FormItem label="考试年级">
            {
              getFieldDecorator('gradeIndex', {
                rules: [{ message: '请选择年级', required: true }],
              })(
                <RadioGroup onChange={this.onGradeDataChange}>
                  {
                    Enums(GradeIndexEnum).map(it =>
                      <Radio key={it.value} value={it.value}>{it.name}</Radio>
                    )
                  }
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem label="考试类型">
            {
              getFieldDecorator('examType', {
                rules: [{ message: '请选择考试类型', required: true }]
              })(
                <Select
                  showSearch={false}
                  style={{ width: 300 }}
                  placeholder="请选择考试类型"
                  filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                >
                  {
                    Enums(ExamTypeEnum).map(it =>
                      <Option key={it.value} value={it.value}>{it.name}</Option>
                    )
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem label="考试时间">
            {getFieldDecorator('examDate', {
              rules: [{ message: '请选择考试时间', required: true }]
            })(
              <RangePicker
                disabledDate={this.disabledDate}
                style={{ width: 300 }} />
            )}
          </FormItem>
          <FormItem label="考场排列">
            {getFieldDecorator('rowCol', {
              rules: [{ message: '请选择排数或列数', required: true }]
            })
              (
                <RowColInputNumber />
              )}
          </FormItem>
          <FormItem label="每考场监考数">
            {getFieldDecorator('monitorNum', {
              rules: [{ message: '请选择监考数', required: true }]
            })(
              <InputNumber min={1} placeholder='监考数' />
            )}
          </FormItem>
          <span className={styles['student-num']}>{`考试最大人数: ${studentNum}`}</span>
          <FormItem label="考试科目">
            {getFieldDecorator('subjectIds', {
              rules: [{ message: '请选择考试科目', required: true }]
            })(
              <CheckboxGroup style={{ width: 800 }} onChange={this.onSubjectChange}>
                <Row>
                  {
                    subjectList.map(it =>
                      <Col key={it.id} span={5} style={{ height: 40 }}>
                        <Checkbox value={it.id}>{it.name}</Checkbox>
                      </Col>
                    )
                  }
                </Row>
              </CheckboxGroup>
            )}
          </FormItem>
          <FormItem label="选择考场">
            {getFieldDecorator('roomIds', {
              rules: [
                { message: '请选择考场', required: true },
                { validator: this.handleRoom }
              ]
            })(
              <CheckboxGroup>
                <div>
                  <span className={styles['all-build']}>全部教室{roomTotal}</span>
                  {
                    buildingList.map(building =>
                      <div key={building.id} >
                        <div className={styles['all-layer']}>
                          <span className={styles['all-layer-text']}>{building.name}</span>
                        </div>
                        {
                          building.children.map(layer =>
                            <div key={layer.id} className={styles['room-container']}>
                              <div style={{ marginRight: 20 }}>{layer.name}</div>
                              <Row gutter={16} type='flex' justify='space-between'>
                                {
                                  layer.children.map(room =>
                                    <Col key={room.id} span={2} style={{ height: 40, width: 90 }}>
                                      <Checkbox value={room.id}>{room.code}</Checkbox>
                                    </Col>
                                  )
                                }
                              </Row>
                            </div>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              </CheckboxGroup>
            )}
          </FormItem>
        </Form>
        <div style={{ height: 100 }}></div>
      </div>
    )
  }
}

class RowColInputNumber extends Component {

  render() {
    const { value, onChange } = this.props;
    const [row, col] = value || [];
    return (
      <Fragment>
        <InputNumber min={1} defaultValue={row} placeholder="排" onChange={(v) => {
          onChange && onChange([v, col]);
        }} />
        <InputNumber min={1} defaultValue={col} style={{ marginLeft: 20 }} placeholder="列"
          onChange={(v) => {
            onChange && onChange([row, v]);
          }} />
      </Fragment>
    )
  }
}