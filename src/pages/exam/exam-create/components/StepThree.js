import React from 'react'
import styles from '../index.less'
import { connect } from 'dva';
import { Button, Table, Checkbox, Input, notification, Modal } from 'antd';
import { ExamCreate } from '../../../../utils/namespace'
import { ManagesSteps } from '../utils/namespace'
import { GradeIndexEnum, Enums } from '../../../../utils/Enum';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

@connect(state => ({
  studentList: state[ExamCreate].studentList,
  oneItem: state[ManagesSteps].oneItem,
  twoItem: state[ManagesSteps].twoItem,
  roomSelectList: state[ManagesSteps].roomSelectList,
  dateSelectList: state[ManagesSteps].dateSelectList,
}))
export default class StepThree extends React.Component {

  state = {
    sortTableData: [],
    roomSubjectIds: []
    // editDisabled: true,
  }

  submitData = () => {
    const examName = this.state.examName;
    console.log('examName: ', examName)
    if (!examName) {
      notification.error({ message: '请输入考试名称' })
      return;
    }
    const { oneItem = {}, twoItem = {},
      dateSelectList = [], dispatch } = this.props;
    const gradeIndex = oneItem['gradeIndex'];
    const examDate = oneItem['examDate'];
    const startDay = examDate[0].valueOf();
    const endDay = examDate[1].valueOf();
    const examType = oneItem['examType'];
    const monitorNum = oneItem['monitorNum'];
    const rowCol = oneItem['rowCol'];

    const teachers = twoItem['teacherIds'] || [];
    const teacherIdList = [];
    teachers.forEach(it => {
      teacherIdList.push({ id: it });
    })

    const roomSubjectIds = this.state.roomSubjectIds || [];
    const disableList = [];
    roomSubjectIds.forEach(it => {
      const ids = it.split('_');
      disableList.push({
        examinationSubjectId: ids[1],
        roomId: ids[0]
      })
    })

    const subjectList = [];
    dateSelectList.forEach(it => {
      const startMonment = it.dateSelect.startTime;
      const endMonment = it.dateSelect.endTime;
      const subjectItem = {
        examinationSubjectId: it.id,
        startTime: startMonment.valueOf(),
        endTime: endMonment.valueOf()
      };
      subjectList.push(subjectItem);
    });

    const roomList = [];
    // console.log('sortTableData:', this.state.sortTableData);
    this.state.sortTableData.forEach((value, index) => {
      const roomItem = {
        roomId: value.id,
        roomPriorityNum: index + 1
      };
      roomList.push(roomItem);
    });

    const examinationInfo = {
      rowTotal: rowCol[0],
      columnTotal: rowCol[1],
      examinationSubjectList: subjectList,
      examinationRoomList: roomList,
      disableList: disableList,
      teacherIdList,
    };

    const examinationInfoList = JSON.stringify(examinationInfo);
    const params = {
      startDay,
      endDay,
      examType,
      monitorNum,
      name: examName,
      gradeIndex,
      examinationInfoList
    }
    console.log('examinationInfo: ', examinationInfo);
    console.log('params: ', params);
    const modal = Modal.info({
      title: '正在提交',
      content: '正在提交...',
    });
    dispatch({
      type: ExamCreate + '/distributionStudent',
      payload: params,
      resolve: () => {
        modal.update({
          title: '提交成功',
          content: '提交成功, 稍后请前往考务列表查看',
        });
      }
    })
  }

  render() {
    const { oneItem = {}, twoItem = {}, roomSelectList = [], dateSelectList = [] } = this.props;
    const roomTotal = roomSelectList.length;
    const subjectTotal = dateSelectList.length;
    const teacherIds = twoItem['teacherIds'] || [];
    const teacherTotal = teacherIds.length;
    const gradeIndex = oneItem['gradeIndex'];
    let gradeName = '';
    Enums(GradeIndexEnum).forEach(it => {
      if (gradeIndex == it.value) {
        gradeName = it.name;
      }
    });
    const rowCol = oneItem['rowCol'];
    const roomStudentTotal = rowCol[0] * rowCol[1];
    // console.log(`roomTotal: ${roomTotal}   subjectTotal: ${subjectTotal}`);
    // console.log('roomSelectList: ', roomSelectList);
    // console.log('dateSelectList: ', dateSelectList);

    const tableData = [];
    roomSelectList.forEach((value, rowIndex) => {
      const roomItem = {
        ...value,
        rowIndex,
        roomStudentTotal
      };
      dateSelectList.forEach((subject, colIndex) => {
        const teacherItem = {
          colIndex,
          teacherName: '禁用',
          teacherId: `${value.id}_${subject.id}`
        };
        roomItem[`teacherColIndex${colIndex}`] = `teacherColIndex${colIndex}`;
        roomItem[`teacherItem${subject.id}`] = teacherItem;
      });
      tableData.push(roomItem);
    });
    // console.log('tableData-init: ', tableData);
    this.state.sortTableData = tableData;

    const columns = [
      {
        title: 'ID',
        dataIndex: 'rowIndex',
        key: 'rowIndex',
        width: 60,
        align: 'center',
        render: (text, record, index) => record.rowIndex + 1
      },
      {
        title: '考场',
        dataIndex: 'roomName',
        key: 'roomName',
        align: 'center'
      },
      {
        title: '人数',
        dataIndex: 'roomStudentTotal',
        key: 'roomStudentTotal',
        align: 'center'
      }
    ];

    dateSelectList.map((it, index) => {
      const startMonment = it.dateSelect.startTime;
      const endMonment = it.dateSelect.endTime;
      const columnItem = {
        title: startMonment.format('YYYY-MM-DD'),
        children: [
          {
            title: `${startMonment.format('HH:mm')}-${endMonment.format('HH:mm')}`,
            children: [
              {
                title: it.name || '-',
                dataIndex: `teacherIndex${index}`,
                key: `teacherColIndex${index}`,
                align: 'center',
                render: (text, record, index) => {
                  const teacherItem = record[`teacherItem${it.id}`];
                  return <Checkbox value={teacherItem.teacherId}>{teacherItem.teacherName}</Checkbox>
                }
                // record[`teacherItem${it.id}`].teacherName
              }
            ],
          }]
      }
      columns.push(columnItem)
    });

    // const editBtn = this.state.editDisabled ? '编辑考场' : '禁用';

    return (
      <div>
        <div className={styles['three-btn-container']}>
          <span className={styles['tip-color']}>请选择禁用的考场(非必选)，通过拖拽表格确定教室优先级</span>
          <div className={styles['three-right-btn-container']}>
            <Input
              onChange={(e) => { this.state.examName = e.target.value }}
              type='text'
              style={{ width: 300, marginRight: 10 }}
              placeholder='请输入考试名称'></Input>
            <Button
              onClick={this.submitData}
              type='primary' className={styles['three-right-btn']}>提交</Button>
          </div>
        </div>
        <span>{`${gradeName}，${roomTotal}个教室，${teacherTotal}位老师`}</span>
        <div style={{ marginTop: 20 }}>
          <DragTable
            columns={columns}
            tableData={tableData}
            roomValueChange={(data) => {
              this.state.roomSubjectIds = data;
            }}
            onDragEnd={(data) => {
              // console.log('tableData-sort:', data);
              this.state.sortTableData = data;
            }}
          />
        </div>
        <div style={{ height: 120 }}></div>
      </div>
    )
  }
}

let dragingIndex = -1;
class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget(
  'row',
  rowTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }),
)(
  DragSource(
    'row',
    rowSource,
    (connect) => ({
      connectDragSource: connect.dragSource(),
    }),
  )(BodyRow),
);

@connect(state => ({
  threeItem: state[ManagesSteps].threeItem,
}))
class DragSortingTable extends React.Component {

  state = {
    tableData: this.props.tableData
  }

  roomValueChange = (e) => {
    // console.log('roomValueChange: ', e)
    const { threeItem, dispatch, roomValueChange } = this.props;
    dispatch({
      type: ManagesSteps + '/saveThreeItem',
      payload: {
        threeItem: { ...threeItem, roomSubjectIds: e }
      }
    });
    roomValueChange(e);
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { tableData } = this.state;
    const { onDragEnd, threeItem, dispatch } = this.props;
    const dragRow = tableData[dragIndex];

    const newState = update(this.state, {
      tableData: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
      },
    });

    const priorityIds = [];
    newState.tableData.forEach((it, index) => {
      it.rowIndex = index;
      priorityIds.push({
        id: it.id,
        roomPriorityNum: index + 1
      });
    });

    // 保存教室优先级顺序
    dispatch({
      type: ManagesSteps + '/saveThreeItem',
      payload: {
        threeItem: { ...threeItem, priorityIds }
      }
    })

    this.setState(newState);

    onDragEnd(this.state.tableData);
  }

  render() {
    const { columns, threeItem = {} } = this.props;
    const { roomSubjectIds = [], priorityIds = [] } = threeItem;
    const tableData = this.state.tableData;
    // console.log('priorityIds: ', priorityIds);
    if (priorityIds && priorityIds.length > 0) {
      priorityIds.forEach(it => {
        tableData.forEach(item => {
          if (item.id == it.id) {
            item.roomPriorityNum = it.roomPriorityNum;
            return;
          }
        });
      });
      const newRoomPri = priorityIds.length + 1;
      tableData.sort((a, b) => {
        const aNum = a.roomPriorityNum || newRoomPri;
        const bNum = b.roomPriorityNum || newRoomPri;
        return aNum - bNum;
      });
      tableData.forEach((it, index) => {
        it.rowIndex = index;
      })
    };
    // console.log('sortTableData: ', tableData);

    return (
      <Checkbox.Group
        onChange={this.roomValueChange}
        defaultValue={roomSubjectIds}>
        <Table
          rowKey={record => record.id}
          columns={columns}
          dataSource={tableData}
          components={this.components}
          pagination={false}
          bordered
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
        />
      </Checkbox.Group>
    );
  }
}

const DragTable = DragDropContext(HTML5Backend)(DragSortingTable);