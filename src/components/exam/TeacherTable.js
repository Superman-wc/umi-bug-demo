import {Table} from 'antd';
import React from 'react';

export default class TeacherTable extends React.Component {

  state = {
    scrollX: 1000
  };

  render() {
    const {examDetail = {}} = this.props;
    const {teacherStatisticList = []} = examDetail;
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
            subjectList.push(subject);
            subjectMap.set(id, subjectList);
          }
        })
      }
    });
    const data = [];
    const subjectCount = [];
    let rowKey = 0;
    for (let value of subjectMap.values()) {
      subjectCount.push(value.length);
      rowKey++;
      const item = {
        id: rowKey,
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
    const maxCount = Math.max(...subjectCount, 10);
    this.state.scrollX = maxCount * 80;
    // console.log('maxCount: ', maxCount);

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
        title: '教学科目',
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
        render: (text, record) => {
          if (record[`teacherItem${i}`]) {
            return <span>{record[`teacherItem${i}`].teacherName}<br/>{record[`teacherItem${i}`].count}</span>;
          } else {
            return '';
          }
        }
      };
      columns.push(item);
    }

    return (
      <Table
        scroll={{x: this.state.scrollX}}
        rowKey={record => record.id}
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
      />
    )
  }
}
