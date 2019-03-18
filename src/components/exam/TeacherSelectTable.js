import { Table, Button, notification } from 'antd';
import React from 'react';
import { ExamDetail as namespace } from '../../utils/namespace';
import { connect } from 'dva';
import { stdColumns } from '../ListPage/index';
import styles from './exam.less';

const teacherMap = new Map();
let tableData = [];
let tableColumns = [];
let tempList = [];
@connect(state => ({
  listTeacher: state[namespace].listTeacher,
}))
export default class TeacherSelectTable extends React.Component {

  state = {
    bordered: true,
    scrollX: 1000,
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
        const { listTeacher, monitorNum } = this.props;
        tempList = listTeacher ? listTeacher.list : [];
        teacherMap.clear();
        this.getTableData(tempList);
        this.getColumnsData(tempList, monitorNum)
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
    this.state.scrollX = maxCount * 80;
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: 60,
        align: 'center',
        fixed: 'left'
      },
      {
        title: '科目',
        dataIndex: 'subjectName',
        key: 'subjectId',
        align: 'center',
        width: 80,
        fixed: 'left'
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
            const btnType = teacherItem.choose ? 'primary' : 'default';
            const selected = teacherItem.selected;
            if (selected) {
              return <span
                className={teacherTextDisable}
              >{teacherItem.teacherName}<br />{teacherItem.count}</span>;
            } else {
              // console.log('monitorNum: ', monitorNum)
              if (monitorNum === 1) {// 单选
                return <Button
                  type={btnType}
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
                >{teacherItem.teacherName}<br />{teacherItem.count}</Button>;
              } else {// 多选
                return <Button
                  type={btnType}
                  onClick={() => {
                    const teacherId = teacherItem.teacherId;
                    if (teacherMap.has(teacherId)) {
                      // 同一个教师可能会有多个科目
                      if (index === teacherMap.get(teacherId)) {
                        teacherMap.delete(teacherId);
                        tableData[index][`teacherItem${i}`].choose = false
                        handleMultiClick(teacherMap);
                        this.setState({
                          bordered: true
                        })
                      } else {
                        const sub = tableData[teacherMap.get(teacherId)].subjectName;
                        notification.warning({ message: `${teacherItem.teacherName}已在${sub}科目中选择` })
                      }
                    } else {
                      if (teacherMap.size < 2) {
                        teacherMap.set(teacherId, index);
                        tableData[index][`teacherItem${i}`].choose = true
                        handleMultiClick(teacherMap);
                        this.setState({
                          bordered: true
                        })
                      } else {
                        notification.error({ message: '超过最大选择数量！' });
                      }
                    }
                  }}
                >{teacherItem.teacherName}<br />{teacherItem.count}</Button>;
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
    const { monitorNum } = this.props;
    this.getColumnsData(tempList, monitorNum);
    return (
      <div>
        <Table
          scroll={{ x: this.state.scrollX }}
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