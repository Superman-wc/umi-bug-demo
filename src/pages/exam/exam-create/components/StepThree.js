import React from 'react'
import styles from '../index.less'
import { connect } from 'dva';
import { Button, Table, Checkbox } from 'antd';
import { ExamCreate } from '../../../../utils/namespace'
import { ManagesSteps } from '../utils/namespace'
import { ExamTypeEnum, GradeIndexEnum, Enums } from '../../../../utils/Enum';
import moment from 'moment';
// import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import update from 'immutability-helper';

@connect(state => ({
  studentList: state[ExamCreate].studentList,
  oneItem: state[ManagesSteps].oneItem,
  twoItem: state[ManagesSteps].twoItem,
  threeItem: state[ManagesSteps].threeItem,
  roomSelectList: state[ManagesSteps].roomSelectList,
  dateSelectList: state[ManagesSteps].dateSelectList,
}))
export default class StepThree extends React.Component {

  state = {
    uuid: null,
    // editDisabled: true,
  }

  // onEditHandClick = () => {
  //   this.setState({
  //     editDisabled: !this.state.editDisabled
  //   })
  // }

  roomValueChange = (e) => {
    console.log('roomValueChange: ', e)
    this.props.dispatch({
      type: ManagesSteps + '/saveThreeItem',
      payload: {
        threeItem: { roomSubjectIds: e }
      }
    })
  }

  submitData = () => {
    const { oneItem = {}, twoItem = {}, threeItem = {},
      roomSelectList = [], dateSelectList = [], dispatch } = this.props;
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

    const roomSubjectIds = threeItem.roomSubjectIds || [];
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
    roomSelectList.forEach((value, index) => {
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
    const { oneItem = {}, twoItem = {}, threeItem = {}, roomSelectList = [], dateSelectList = [] } = this.props;
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
    const roomSubjectIds = threeItem.roomSubjectIds || [];
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
    console.log('tableData: ', tableData);

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
          <span className={styles['tip-color']}>请选择禁用的考场(非必选)</span>
          <div className={styles['three-right-btn-container']}>
            {/* <Button
              disabled={this.state.studentBtnDisabled}
              type='primary'
              className={styles['three-right-btn']}
              onClick={this.distributionStudent}
            >智能分配考生</Button>
            <Button
              disabled={this.state.teacherBtnDisabled}
              type='primary' className={styles['three-right-btn']}>智能安排监考</Button> */}
            <Button
              onClick={this.submitData}
              type='primary' className={styles['three-right-btn']}>提交</Button>
          </div>
        </div>
        <span>{`${gradeName}，${roomTotal}个教室，${teacherTotal}位老师`}</span>
        <div style={{ marginTop: 20 }}>
          <Checkbox.Group
            defaultValue={roomSubjectIds}
            disabled={this.state.editDisabled}
            onChange={this.roomValueChange}>
            <Table
              rowKey={record => record.id}
              columns={columns}
              dataSource={tableData}
              pagination={false}
              bordered={this.state.bordered}
            />
          </Checkbox.Group>

        </div>
        <div style={{ height: 120 }}></div>
      </div>
    )
  }
}