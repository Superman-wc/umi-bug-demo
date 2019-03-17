import React from 'react'
import styles from '../index.less'
import { connect } from 'dva';
import { Button, Table, Checkbox } from 'antd';
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
    uuid: null,
    sortTableData: [],
    roomSubjectIds: []
    // editDisabled: true,
  }

  submitData = () => {
    const { oneItem = {}, twoItem = {},
      dateSelectList = [], dispatch } = this.props;
    const gradeIndex = oneItem['gradeIndex'];
    const rowCol = oneItem['rowCol'];
    const teachers = twoItem['teacherIds'] || [];
    const teacherIdList = [];
    teachers.forEach(it => {
      teacherIdList.push({ id: it });
    })
    let uuid = this.state.uuid;
    if (!uuid) {
      uuid = (new Date()).valueOf();
      this.state.uuid = uuid;
    }

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
      const startMonment = it.dateList[0];
      const endMonment = it.dateList[1];
      const subjectItem = {
        examinationSubjectId: it.id,
        startTime: startMonment.valueOf(),
        endTime: endMonment.valueOf()
      };
      subjectList.push(subjectItem);
    });

    const roomList = [];
    console.log('sortTableData:', this.state.sortTableData);
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
    console.log('examinationInfoList: ', examinationInfo);
    // dispatch({
    //   type: ExamCreate + '/distributionStudent',
    //   payload: {
    //     uuid,
    //     gradeIndex,
    //     examinationInfoList
    //   }
    // })
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
    console.log(`roomTotal: ${roomTotal}   subjectTotal: ${subjectTotal}`);
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
      const startMonment = it.dateList[0];
      const endMonment = it.dateList[1];
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
          <span className={styles['tip-color']}>请选择禁用的考场(非必选),通过拖拽表格确定教室优先级</span>
          <div className={styles['three-right-btn-container']}>
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
  endDrag(props) {
    console.log('endDrag=====')
  }
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
    console.log('roomValueChange: ', e)
    this.props.dispatch({
      type: ManagesSteps + '/saveThreeItem',
      payload: {
        threeItem: { roomSubjectIds: e }
      }
    });
    this.props.roomValueChange(e);
  }


  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { tableData } = this.state;
    const { onDragEnd } = this.props;
    const dragRow = tableData[dragIndex];

    // this.setState(
    //   update(this.state, {
    //     tableData: {
    //       $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    //     },
    //   }),
    // );

    const newState = update(this.state, {
      tableData: {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
      },
    });

    newState.tableData.forEach((it, index) => {
      it.rowIndex = index;
    })

    this.setState(newState);

    onDragEnd(this.state.tableData);
  }

  render() {
    const { columns, threeItem = {} } = this.props;
    const { roomSubjectIds } = threeItem;
    return (
      <Checkbox.Group
        onChange={this.roomValueChange}
        defaultValue={roomSubjectIds}>
        <Table
          rowKey={record => record.id}
          columns={columns}
          dataSource={this.state.tableData}
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