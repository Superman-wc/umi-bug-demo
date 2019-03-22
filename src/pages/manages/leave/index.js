import React, {Component} from 'react';
import {connect} from 'dva';
import router from 'umi/router';
import {Input} from 'antd';
import {
  ManagesRoom, ManagesLeave as namespace,
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
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
      },
    }, {
      key: 'rollback'
    }];

    const columns = [
      {
        title: '学生', key: 'studentName', width: 350, render: (v, item) =>
          <Flex style={{height: 'auto'}} align="middle" justify="center">
            <div style={{textAlign: 'right', width: 120}}>
              <img src={item.avatar + '!avatar'} style={{marginRight: 10, width: 80}}/>
            </div>
            <Flex.Item style={{fontSize: 20, textAlign: 'left'}}>
              <div>{item.unitName}</div>
              <div>{v}</div>
              <div style={{fontSize: '80%'}}>{item.code}</div>
            </Flex.Item>
          </Flex>
      },
      {title: '请假开始时间', key: 'startTime', width: 160, type: 'dateTime'},
      {title: '请假结束时间', key: 'endTime', width: 160, type: 'dateTime'},
      {title: '教师', key: 'teacherName', width: 100,},
      {title: '登记时间', key: 'dateCreated', width: 160,},
      {title: '', key: 'id', width: 'auto', render: v => ''}
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
        headerChildren={
          <div>
            <Input.Search
              placeholder="输入学号或姓名"
              enterButton="搜索"
              onSearch={value => {
                const args = {};
                if (value) {
                  if (/^\d+/g.test(value)) {
                    args.studentCode = value;
                    args.studentName = undefined;
                  } else {
                    args.studentName = value;
                    args.studentCode = undefined;
                  }
                } else {
                  args.studentName = undefined;
                  args.studentCode = undefined;
                }
                router.replace({pathname, query: {...query, ...args}});
              }}
            />
          </div>
        }
      />
    );
  }
}


