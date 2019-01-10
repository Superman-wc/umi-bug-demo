import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input ,notification} from 'antd';
import {
  ManagesClass,
  ManagesRoom,
  ManagesLeave as namespace,
  ManagesGrade,
  ManagesSubject
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {ClassTypeEnum, CourseTypeEnum, Enums} from "../../../utils/Enum";

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  roomList: state[ManagesRoom].list,
}))
export default class LeaveList extends Component {

  state = {};

  render() {
    const {list, total, loading, location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '请假列表';

    const breadcrumb = ['管理', '请假管理', title];

    const buttons = [];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '设备名称', key: 'name'},
      {title: '设备编号', key: 'device'},
      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => this.setState({visible: true, item: row}),
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];



    return (
      <ListPage
        operations={buttons}
        location={location}
        loading={!!loading}
        columns={columns}
        breadcrumb={breadcrumb}
        list={list}
        total={total}
        pagination
        title={title}
      />
    );
  }
}


