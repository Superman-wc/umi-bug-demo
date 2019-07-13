import React, {Component} from 'react'
import styles from '../index.less'
import {connect} from 'dva';
import {Button, Table, Checkbox, Input, notification, Modal} from 'antd';
import {ExamCreate, ExamList} from '../../../../utils/namespace'
import {ManagesSteps} from '../utils/namespace'
import {GradeIndexEnum, Enums} from '../../../../utils/Enum';
import {DragDropContext, DragSource, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import router from 'umi/router';

@connect(state => ({
  studentList: state[ExamCreate].studentList,
  updateThree: state[ManagesSteps].updateThree,
  oneItem: state[ManagesSteps].oneItem,
  twoItem: state[ManagesSteps].twoItem,
  roomSelectList: state[ManagesSteps].roomSelectList,
  dateSelectList: state[ManagesSteps].dateSelectList,
}))
export default class StepThree extends Component {

  state = {
    sortTableData: [],
    roomSubjectIds: [],
    examName: null,
    successModalVisible: false,
    editModalVisible: false,
    // editDisabled: true,
  };

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.updateThree && nextProps.updateThree !== this.props.updateThree) {
      console.log('updateThree: ', nextProps.updateThree);
      this.setState({editModalVisible: true});
    }
  }

  submitData = () => {
    const {examName, roomSubjectIds = []} = this.state;


    if (!examName) {
      notification.error({message: '请输入考试名称'});
      return;
    }

    const {oneItem = {}, twoItem = {}, dateSelectList = [], dispatch} = this.props;
    const {seatAssignment, gradeIndex, examDate, examType, monitorNum, rowCol} = oneItem;

    const teacherIdList = (twoItem.teacherId.teacherIds || []).map(it => ({id: it}));

    const disableList = (roomSubjectIds || []).map(it => {
      const ids = it.split('_');
      return {
        examinationSubjectId: ids[1],
        roomId: ids[0]
      }
    });

    const subjectList = dateSelectList.map(it => ({
      examinationSubjectId: it.id,
      startTime: it.dateSelect.startDateTime.valueOf(),
      endTime: it.dateSelect.endDateTime.valueOf()
    }));

    const roomList = this.state.sortTableData.map((value, index) => ({
      roomId: value.id,
      roomPriorityNum: index + 1
    }));


    const payload = {
      startDay: examDate[0].valueOf(),
      endDay: examDate[1].valueOf(),
      examType,
      monitorNum,
      seatAssignment,
      name: examName,
      gradeIndex,
      examinationInfoList: JSON.stringify({
        rowTotal: rowCol.row,
        columnTotal: rowCol.col,
        examinationSubjectList: subjectList,
        examinationRoomList: roomList,
        disableList,
        teacherIdList,
      })
    };

    this.setState({
      editModalVisible: false,
    });

    dispatch({
      type: ExamCreate + '/distributionStudent',
      payload,
      resolve: () => {
        this.setState({
          successModalVisible: true,
        });
      }
    });
  };

  render() {
    const {oneItem = {}, twoItem = {}, roomSelectList = [], dateSelectList = []} = this.props;
    const {gradeIndex, rowCol} = oneItem;
    const roomTotal = roomSelectList.length;
    const teacherIds = twoItem.teacherId.teacherIds || [];
    const teacherTotal = teacherIds.length;

    const gradeName = GradeIndexEnum[gradeIndex];

    const roomStudentTotal = rowCol.row * rowCol.col;

    const tableData = roomSelectList.map((value, rowIndex) => {
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
      return roomItem;
    });


    const columns = [
      {
        title: 'ID',
        dataIndex: 'rowIndex',
        key: 'rowIndex',
        width: 40,
        align: 'center',
        render: v => v + 1
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

    dateSelectList.forEach((it, index) => {
      const start = it.dateSelect.startDateTime;
      const end = it.dateSelect.endDateTime;
      const columnItem = {
        title: start.format('MM-DD'),
        children: [
          {
            title: `${start.format('HH:mm')}-${end.format('HH:mm')}`,
            children: [
              {
                title: it.name || '-',
                dataIndex: `teacherIndex${index}`,
                key: `teacherColIndex${index}`,
                align: 'center',
                render: (text, record) => {
                  const teacherItem = record[`teacherItem${it.id}`];
                  return <Checkbox value={teacherItem.teacherId}>{teacherItem.teacherName}</Checkbox>
                }
                // record[`teacherItem${it.id}`].teacherName
              }
            ],
          }]
      };
      columns.push(columnItem)
    });

    // const editBtn = this.state.editDisabled ? '编辑考场' : '禁用';
    const footer = (
      <div>
        <Button onClick={() => {
          router.push({pathname: ExamList});
        }}>查看列表</Button>
        <Button type='primary' onClick={() => {
          this.setState({successModalVisible: false});
        }}>确定</Button>
      </div>
    );

    return (
      <div>
        <div className={styles['three-btn-container']}>
          <span className={styles['tip-color']}>请选择禁用的考场(非必选)，通过拖拽表格确定教室优先级</span>
        </div>
        <span>{`${gradeName}，${roomTotal}个教室，${teacherTotal}位老师`}</span>
        <div style={{marginTop: 20}}>
          <DragTable
            columns={columns}
            tableData={tableData}
            roomValueChange={(roomSubjectIds) => {
              // this.state.roomSubjectIds = data;
              this.setState({roomSubjectIds});
            }}
            onDragEnd={(sortTableData) => {
              // console.log('tableData-sort:', data);
              // this.state.sortTableData = data;
              this.setState({sortTableData});
            }}
          />
        </div>
        <Modal
          title={'提交成功'}
          visible={this.state.successModalVisible}
          footer={footer}
        >
          <p>由于数据量较大, 本次考务大约需要1~30分钟安排完毕, 稍后请前往考务列表查看</p>
        </Modal>
        <Modal
          title={'请输入考务名称'}
          visible={this.state.editModalVisible}
          onCancel={() => {
            this.setState({editModalVisible: false});
          }}
          onOk={this.submitData}
        >
          <Input
            onChange={(e) => {
              this.state.examName = e.target.value
            }}
            type='text'
            style={{width: 300, marginRight: 10}}
            placeholder='请输入考试名称'/>
        </Modal>
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
    const style = {...restProps.style, cursor: 'move'};

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
  };

  componentDidMount() {
    const {onDragEnd} = this.props;
    // 初始化
    onDragEnd(this.state.tableData);
  }

  roomValueChange = (e) => {
    // console.log('roomValueChange: ', e)
    const {threeItem, dispatch, roomValueChange} = this.props;
    dispatch({
      type: ManagesSteps + '/saveThreeItem',
      payload: {
        threeItem: {...threeItem, roomSubjectIds: e}
      }
    });
    roomValueChange(e);
  };

  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const {tableData} = this.state;
    const {onDragEnd, threeItem, dispatch} = this.props;
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
        threeItem: {...threeItem, priorityIds}
      }
    });

    this.setState(newState);

    onDragEnd(this.state.tableData);
  };

  render() {
    const {columns, threeItem = {}} = this.props;
    const {roomSubjectIds = [], priorityIds = []} = threeItem;
    const tableData = this.state.tableData;
    // console.log('priorityIds: ', priorityIds);
    if (priorityIds && priorityIds.length > 0) {
      for (let priority of priorityIds) {
        for (let table of tableData) {
          if (table.id.toString() === priority.id.toString()) {
            table.roomPriorityNum = priority.roomPriorityNum;
            break;
          }
        }
      }
      const newRoomPri = priorityIds.length + 1;
      tableData.sort((a, b) => {
        const aNum = a.roomPriorityNum || newRoomPri;
        const bNum = b.roomPriorityNum || newRoomPri;
        return aNum - bNum;
      });
      tableData.forEach((it, index) => {
        it.rowIndex = index;
      });
      // console.log('tableData: ', tableData)
    }
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
