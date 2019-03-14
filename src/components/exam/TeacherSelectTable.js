import { Table, notification } from 'antd';
import React from 'react';
import { ExamDetail as namespace } from '../../utils/namespace';
import { connect } from 'dva';
import { stdColumns } from '../ListPage/index';
import styles from './exam.less';

const teacherSet = new Set()
let tableData = [];
let tableColumns = [];
let tempList = [];
@connect(state => ({
  listTeacher: state[namespace].listTeacher,
}))
export default class TeacherSelectTable extends React.Component {

  state = {
    bordered: true
  }

  componentDidMount() {
    if (this.props.examinationId && this.props.examinationSubjectId) {
      this.fetchTeacherList(this.props.examinationId, this.props.examinationSubjectId);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if ((nextProps.examinationPlaceId && nextProps.examinationPlaceId !== this.props.examinationPlaceId) ||
      (nextProps.examinationId && nextProps.examinationId !== this.props.examinationId) ||
      (nextProps.examinationSubjectId && nextProps.examinationSubjectId !== this.props.examinationSubjectId)) {
      this.fetchTeacherList(nextProps.examinationId, nextProps.examinationSubjectId);
    }
  }

  fetchTeacherList = (examinationId, examinationSubjectId) => {
    this.props.dispatch({
      type: namespace + '/listTeacher',
      payload: {
        examinationId: examinationId,
        examinationSubjectId: examinationSubjectId,
        s: 10000
      },
      resolve: () => {
        const { listTeacher, monitorNum, examinationPlaceId } = this.props;
        tempList = listTeacher ? listTeacher.list : [];
        teacherSet.clear();
        this.getTableData(tempList, monitorNum);
        this.getColumnsData(tempList)
        this.setState({ bordered: true });
      }
    });
  }

  getColumnsData(teacherStatisticList = [], monitorNum = 1) {
    const { handleClickName, handleMultiClick } = this.props
    const subjectMap = new Map();
    teacherStatisticList.map(it => {
      if (it.subjectList) {
        it.subjectList.map(subject => {
          const id = subject.id;
          if (subjectMap.has(id)) {
            subjectMap.get(id).push(subject);
          } else {
            const subjectList = [];
            subjectList.push(subject)
            subjectMap.set(id, subjectList);
          }
        })
      }
    });
    const subjectCount = [];
    for (let value of subjectMap.values()) {
      subjectCount.push(value.length)
    }
    const maxCount = Math.max(...subjectCount);
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: 60,
        align: 'center'
      },
      {
        title: '科目',
        dataIndex: 'subjectName',
        key: 'subjectId',
        align: 'center'
      },
    ];
    for (let i = 1; i <= maxCount; i++) {
      const item = {
        title: i,
        dataIndex: 'colkey' + i,
        key: 'colkey' + i,
        align: 'center',
        render: (text, record, index) => {
          const teacherItem = record[`teacherItem${i}`]
          if (teacherItem) {
            const teacherTextDisable = styles['teacherTextDisable'];
            const teacherTextEnable = styles['teacherTextEnable'];
            const teacherTextChoose = teacherItem.choose ? styles['teacherTextSelected'] : styles['teacherTextEnable'];
            const selected = teacherItem.selected;
            if (selected) {
              return <span
                className={teacherTextDisable}
              >{teacherItem.teacherName}<br />{teacherItem.count}</span>;
            } else {
              if (monitorNum === 1) {// 单选
                return <span
                  className={teacherTextEnable}
                  onClick={() => {
                    this.props.dispatch({
                      type: namespace + '/updateTeacherInDetail',
                      payload: {
                        examinationPlaceId: this.props.examinationPlaceId,
                        teacherList: teacherItem.teacherId
                      },
                      resolve: () => {
                        notification.success({ message: '分配教师成功' });
                        handleClickName()
                      }
                    })
                  }}
                >{teacherItem.teacherName}<br />{teacherItem.count}</span>;
              } else {// 多选
                return <span
                  className={teacherTextChoose}
                  onClick={() => {
                    const teacherId = teacherItem.teacherId;
                    if (teacherSet.has(teacherId)) {
                      teacherSet.delete(teacherId);
                      tableData[index][`teacherItem${i}`].choose = false
                      handleMultiClick(teacherSet);
                      this.setState({
                        bordered: true
                      })
                    } else {
                      if (teacherSet.size < 2) {
                        teacherSet.add(teacherId);
                        tableData[index][`teacherItem${i}`].choose = true
                        handleMultiClick(teacherSet);
                        this.setState({
                          bordered: true
                        })
                      } else {
                        notification.error({ message: '超过最大选择数量！' });
                      }
                    }
                  }}
                >{teacherItem.teacherName}<br />{teacherItem.count}</span>;
              }
            }
          } else {
            return '';
          }
        }
      };
      columns.push(item);
    }
    tableColumns = columns;
  }

  getTableData(teacherStatisticList = []) {
    const subjectMap = new Map();
    teacherStatisticList.map(it => {
      if (it.subjectList) {
        it.subjectList.map(subject => {
          const id = subject.id;
          subject.teacherName = it.name;
          subject.count = it.count;
          subject.selected = it.selected;
          subject.teacherId = it.teacherId;
          if (subjectMap.has(id)) {
            subjectMap.get(id).push(subject);
          } else {
            const subjectList = [];
            subjectList.push(subject)
            subjectMap.set(id, subjectList);
          }
        })
      }
    });
    const data = [];
    let subjectIndex = 0;
    for (let value of subjectMap.values()) {
      subjectIndex++;
      const item = {
        id: subjectIndex,
        subjectId: value[0].id,
        subjectName: value[0].name,
      };
      value.map((it, index) => {
        item[`colkey${index + 1}`] = 'col' + (index + 1);
        const teacherItem = {
          teacherName: it.teacherName,
          count: it.count,
          selected: it.selected,
          teacherId: it.teacherId,
        };
        item[`teacherItem${index + 1}`] = teacherItem;
      });
      data.push(item);
    }
    tableData = data;
  }

  render() {
    this.getColumnsData(tempList)
    return (
      <div>
        <Table
          rowKey={record => record.id}
          columns={stdColumns(tableColumns)}
          dataSource={tableData || []}
          pagination={false}
          bordered={this.state.bordered}
        />
      </div>
    )
  }
}