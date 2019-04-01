import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Tree, Radio, DatePicker, InputNumber, Select, Checkbox, Row, Col, notification } from 'antd';
import { ExamCreate } from '../../../../utils/namespace';
import { ManagesSteps } from '../utils/namespace';
import { ExamTypeEnum, GradeIndexEnum, Enums } from '../../../../utils/Enum';
import styles from '../index.less';
import moment from 'moment';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group;
@connect(state => ({
  subjectList: state[ExamCreate].subjectList,
  doorPlateList: state[ExamCreate].doorPlateList,
  oneItem: state[ManagesSteps].oneItem,
  updateOne: state[ManagesSteps].updateOne,
  studentNum: state[ManagesSteps].studentNum,
  needRoomNum: state[ManagesSteps].needRoomNum
}))
@Form.create({
  mapPropsToFields(props) {
    const {
      examDate, examType, gradeIndex, rowCol, monitorNum, subjectIds,
      roomId, seatAssignment
    } = props.oneItem || {};
    return {
      examType: Form.createFormField({ value: examType || undefined }),
      gradeIndex: Form.createFormField({ value: gradeIndex || undefined }),
      examDate: Form.createFormField({ value: examDate || undefined }),
      rowCol: Form.createFormField({ value: rowCol || undefined }),
      monitorNum: Form.createFormField({ value: monitorNum || undefined }),
      subjectIds: Form.createFormField({ value: subjectIds || undefined }),
      roomId: Form.createFormField({ value: roomId || undefined }),
      seatAssignment: Form.createFormField({ value: seatAssignment || 0 }),
    }
  },
  onValuesChange(props, values) {
    const { form: { getFieldsValue }, dispatch } = props;
    let item = getFieldsValue();
    if (values['gradeIndex']) {
      item['subjectIds'] = [];
    }
    // console.log('item', item)
    dispatch({
      type: ManagesSteps + '/saveOneItem',
      payload: {
        oneItem: { ...item, ...values }
      }
    });
  }
})
export default class StepOne extends React.Component {

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.updateOne && nextProps.updateOne !== this.props.updateOne) {
      // console.log('update: updateOne: ', nextProps.updateOne);
      const { form: { getFieldsValue, validateFieldsAndScroll }, onCheckSuccess, studentNum } = this.props
      const item = getFieldsValue();
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          if (errors['roomId']) {
            if (payload.roomId && payload.rowCol && payload.rowCol.row && payload.rowCol.col) {
              const row = payload.rowCol.row;
              const col = payload.rowCol.col;
              const length = payload.roomId.roomIds.length;
              const total = row * col * length;
              const needRoomNum = Math.ceil(studentNum / (row * col));
              if (studentNum > total) {
                notification.warning({ message: `考场数量过少, 当前已选${length}, 需要${needRoomNum}` });
              }
            }
          }
        } else {
          console.log('stepOne: ', payload);
          const { subjectIds = [], roomId: { roomIds = [] } } = item;
          const { subjectList, doorPlateList, dispatch } = this.props;

          const subjectSelectList = [];
          subjectList.forEach(it => {
            if (subjectIds.indexOf(it.id) !== -1) {
              subjectSelectList.push(it);
            }
          });

          const roomSelectList = [];
          doorPlateList.forEach(it => {
            if (roomIds.indexOf(it.id + '') !== -1) {
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
    const { subjectList, dispatch, oneItem: { rowCol } } = this.props;
    const totals = [0];
    value.forEach(it => {
      const subject = subjectList.find(value => value.id === it);
      if (subject) {
        totals.push(subject.studentNum);
      }
    });
    const max = Math.max(...totals);
    // console.log('onSubjectChange-max: ', max);
    dispatch({
      type: ManagesSteps + '/saveStudentNum',
      payload: {
        studentNum: max
      }
    });
    if (rowCol && rowCol.row && rowCol.col) {
      const needRoomNum = Math.ceil(max / (rowCol.row * rowCol.col));
      // console.log('needRoomNum: ', needRoomNum);
      dispatch({
        type: ManagesSteps + '/saveRoomNum',
        payload: {
          needRoomNum
        }
      });
    }
  };

  onRowcolChange = (value) => {
    const { studentNum, dispatch } = this.props;
    if (value && value.row && value.col && studentNum) {
      const needRoomNum = Math.ceil(studentNum / (value.row * value.col));
      // console.log('needRoomNum: ', needRoomNum);
      dispatch({
        type: ManagesSteps + '/saveRoomNum',
        payload: {
          needRoomNum
        }
      });
    }
  };

  // 选择的人数需大于考试科目最大数
  handleRoom = (rule, value, callback) => {
    const { studentNum, oneItem: { rowCol = {} } } = this.props;
    // console.log('handleRoom: ', value);
    if (value && value.roomIds && rowCol.row && rowCol.col) {
      const length = value.roomIds.length;
      const total = rowCol.row * rowCol.col * length;
      const needRoomNum = Math.ceil(studentNum / (rowCol.row * rowCol.col));
      if (studentNum > total) {
        callback(`考场数量过少, 当前已选${length}, 需要${needRoomNum}`);
        return;
      }
    }
    callback();
  };

  handleRowcol = (rule, value, callback) => {
    if (value && value.row && value.col) {
      callback();
    } else {
      callback('请选择排或列');
    }
  };

  disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  render() {
    const {
      subjectList = [], doorPlateList = [], studentNum = 0, needRoomNum = 0,
      form: { getFieldDecorator }
    } = this.props;
    // console.log('needRoomNum: ', needRoomNum);

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
    // console.log('buildingList: ', buildingList);
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
          <FormItem label="学生座位安排">
            {
              getFieldDecorator('seatAssignment', {
                initialValue: 0,
                rules: [{ message: '请选择', required: true }],
              })(
                <RadioGroup>
                  <Radio value={0}>随机</Radio>
                  <Radio value={1}>孤岛</Radio>
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
              rules: [
                { message: '请选择排数或列数', required: true },
                { validator: this.handleRowcol }
              ]
            })
              (
                <RowColInputNumber onChange={this.onRowcolChange} />
              )}
          </FormItem>
          <FormItem label="每考场监考数">
            {getFieldDecorator('monitorNum', {
              rules: [{ message: '请选择监考数', required: true }]
            })(
              <InputNumber min={1} placeholder='监考数' />
            )}
          </FormItem>
          <FormItem label="考试科目">
            {getFieldDecorator('subjectIds', {
              rules: [{ message: '请选择考试科目', required: true }]
            })(
              <CheckboxGroup style={{ width: 800 }} onChange={this.onSubjectChange}>
                <div>
                  <span className={styles['student-num']}>{`考试最大人数: ${studentNum}`}</span>
                </div>
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
            {getFieldDecorator('roomId', {
              rules: [
                { message: '请选择考场', required: true },
                { validator: this.handleRoom }
              ]
            })(
              <RoomTree
                roomTotal={roomTotal}
                needRoomNum={needRoomNum}
                data={buildingList} />
            )}
          </FormItem>
        </Form>
        <div style={{ height: 100 }}></div>
      </div>
    )
  }
}

/**
 * 考场排列
 */
class RowColInputNumber extends Component {

  constructor(props) {
    super(props);
    const value = props.value || {};
    this.state = {
      row: value.row || null,
      col: value.col || null,
    };
  }

  handleRowChange = (row) => {
    const value = {
      row: row
    };
    this.setState(value);
    this.triggerChange(value);
  };

  handleColChange = (col) => {
    const value = {
      col: col
    };
    this.setState(value);
    this.triggerChange(value);
  };

  triggerChange = (changeValue) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changeValue));
    }
  };

  render() {
    const { row, col } = this.state;
    return (
      <Fragment>
        <InputNumber
          min={1}
          value={row}
          defaultValue={1}
          placeholder="排"
          onChange={this.handleRowChange} />
        <InputNumber
          min={4}
          max={6}
          value={col}
          defaultValue={4}
          style={{ marginLeft: 20 }}
          placeholder="4~6列"
          onChange={this.handleColChange} />
      </Fragment>
    )
  }
}

class RoomTree extends Component {

  // state = {
  //   currentNum: 0
  // }

  handleRoomId = (value) => {
    const { onChange } = this.props;
    const roomIds = [];
    value.forEach(it => {
      if (it.charAt(0) !== 'p') {
        roomIds.push(it);
      }
    });
    // this.setState({ currentNum: roomIds.length });
    onChange({
      roomIds,
      selectKeys: value
    });
  };

  renderTreeNodes = data => data.map(building => {
    return (
      <Tree.TreeNode
        title={building.name}
        key={`p1${building.id}`}>
        {
          building.children.map(layer => {
            return (
              <Tree.TreeNode
                className={styles["tree-container"]}
                title={layer.name}
                key={`p2${layer.id}`}>
                {
                  layer.children.map(room => {
                    return (
                      <Tree.TreeNode
                        title={room.code}
                        key={room.id} />
                    )
                  })
                }
              </Tree.TreeNode>
            )
          })
        }
      </Tree.TreeNode>
    )
  });

  render() {
    const { roomTotal, needRoomNum, data, value = {} } = this.props;
    const { selectKeys = [] } = value;
    return (
      <div>
        <div>
          <span className={styles['all-build']}>
            全部教室{roomTotal}
          </span>
        </div>
        <div>
          <span className={styles['room-select']}>
            至少需要{needRoomNum}个教室
          </span>
        </div>
        {
          data && data.length > 0 &&
          <Tree
            checkable
            onCheck={this.handleRoomId}
            checkedKeys={selectKeys}
            defaultExpandAll={true}>
            {this.renderTreeNodes(data)}
          </Tree>
        }
      </div>
    )
  }
}
