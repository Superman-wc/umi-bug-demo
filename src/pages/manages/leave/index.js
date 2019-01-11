import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input, notification} from 'antd';
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
import Flex from '../../../components/Flex';

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

    const buttons = [{
      key: 'refresh',
      children: '刷新',
      type: 'primary',
      onClick: () => {
        dispatch({
          type: namespace + '/list',
          payload: {
            ...query
          }
        });
      }
    }];

    const columns = [
      {
        title: '学生', key: 'studentName', width: 200, render: (v, item) =>
          <Flex style={{height: 'auto'}} align="middle" justify="center">
            <div style={{textAlign: 'right', width: 120}}>
              <img src={item.avatar + '!t'} style={{marginRight: 10, width: 80, height: 80}}/>
            </div>
            <Flex.Item style={{fontSize: 20, textAlign: 'left'}}>
              <div>{item.unitName}</div>
              <div>{v}({item.code})</div>
            </Flex.Item>
          </Flex>
      },
      {title: '请假开始时间', key: 'startTime', width: 100, type: 'dateTime'},
      {title: '请假结束时间', key: 'endTime', width: 100, type: 'dateTime'},
      {title: '教师', key: 'teacherName', width: 100,},
      {title: '登记时间', key: 'dateCreated', width: 100,},
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


