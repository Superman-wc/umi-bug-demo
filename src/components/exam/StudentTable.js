import { Table } from 'antd';
import React from 'react';
import { ExamDetail as namespace } from '../../utils/namespace';
import { connect } from 'dva';
import { stdColumns } from '../ListPage/index'

@connect(state => ({
  listStudent: state[namespace].listStudent
}))
export default class StudentTable extends React.Component {

  componentDidMount() {
    if (this.props.placeId) {
      this.fetchStudentList(this.props.placeId);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.placeId !== this.props.placeId && nextProps.placeId) {
      this.fetchStudentList(nextProps.placeId);
    }
  }

  fetchStudentList = (placeId) => {
    this.props.dispatch({
      type: namespace + '/listStudent',
      payload: {
        examinationPlaceId: placeId,
        s: 10000
      }
    });
  }

  render() {

    const { listStudent } = this.props;
    // console.log('listStudent: ', listStudent);
    const data = listStudent ? listStudent.list : []

    const columns = [
      {
        title: '序号',
        key: 'studentId',
        width: 60,
        align: 'center',
        render: (text, record, index) => index + 1
      },
      {
        title: '班级',
        key: 'unitName',
        align: 'center'
      },
      {
        title: '姓名',
        key: 'name',
        align: 'center'
      },
      {
        title: '学号',
        key: 'code',
        align: 'center'
      },
      {
        title: '座位',
        key: 'seat',
        align: 'center',
        render: (text, record) => `${record.row}排${record.column}`
      },
    ];

    return (
      <div>
        <Table
          rowKey={record => record.studentId}
          columns={stdColumns(columns)}
          dataSource={data || []}
          pagination={false}
          bordered
        />
      </div>
    )
  }
}