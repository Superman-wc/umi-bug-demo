import { Table } from 'antd';
import React from 'react';
import moment from 'moment';
import styles from './exam.less'
import { Record } from 'immutable';
import '../ListPage/ListPage.less';

export default class ExamTable extends React.Component {

  render() {
    const { examDetail = {} } = this.props;
    const { arrangeList = [], periodList = [], roomList = [] } = examDetail;
    const columns = [
      {
        title: 'ID',
        dataIndex: 'roomId',
        key: 'roomId',
        align: 'center'
      },
      {
        title: '考场',
        dataIndex: 'roomName',
        key: 'roomPriorityNum',
        align: 'center'
      },
    ];
    periodList.map((it) => {
      // record.startDay ? moment(record.startDay).format('YYYY-MM-DD') : '-'
      const startTime = it.startTime ? moment(it.startTime).format('HH:mm') : '-';
      const endTime = it.startTime ? moment(it.endTime).format('HH:mm') : '-';
      const item = {
        title: it.startTime ? moment(it.startTime).format('YYYY-MM-DD') : '-',
        children: [
          {
            title: `${startTime}-${endTime}`,
            children: [
              {
                title: it.name || '-',
                dataIndex: 'name' + it.examinationSubjectId,
                key: 'id' + it.examinationSubjectId,
                align: 'center'
              }],
          }],
      };
      columns.push(item);
    });

    const data = [];
    roomList.sort((a, b) => a.roomPriorityNum - b.roomPriorityNum);
    roomList.map((it, index) => {
      const item = {
        roomId: it.roomId || index,
        roomName: it.name || '-' + index,
        roomPriorityNum: it.roomPriorityNum || index
      };
      periodList.map((period) => {
        item[`id${period.examinationSubjectId}`] = 'id' + period.examinationSubjectId;
        arrangeList.map((arrange) => {
          if ((arrange.examinationSubjectId == period.examinationSubjectId) && (arrange.roomId == it.roomId)) {
            if (arrange.teacherList && arrange.teacherList.length > 0) {
              let teachers = '';
              arrange.teacherList.map((teacher) => {
                teachers += `${teacher.name}\\`;
              })
              var str = teachers.substring(0, teachers.length - 1);
              item[`name${period.examinationSubjectId}`] = str;
            }
            return;
          }
        })
      });
      data.push(item);
    });
    // console.log(JSON.stringify(data));

    return (
      <div>
        <Table
          rowKey={record => record.roomId}
          columns={columns}
          dataSource={data}
          bordered
          size="middle"
          pagination={false}
        />
      </div>
    )
  }
}