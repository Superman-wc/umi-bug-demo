import React, {Component} from 'react';
import router from 'umi/router';
import {connect} from 'dva';
import {Form, Modal, Select, Input, notification, Checkbox} from 'antd';
import classNames from 'classnames';
import {
  ManagesClass,
  ManagesGrade, ManagesSubject,
  ManagesTeacher as namespace,
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';


import styles from './scheduling.less';


@connect(state=>({

}))
export default class SchedulingList extends Component {
  render(){
    const {
      list, total, loading,
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '行政班排课方案列表';

    const breadcrumb = ['排课', '行政班排课管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          router.push({pathname: pathname+'/create'});
        },
      },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id', width: 40,},
      {title: '方案名称', key: 'name', width: 80,},
      {
        title: '操作',
        key: 'operate',
        width: 100,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item: row});
              },
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
        scrollHeight={176}
        headerChildren={
          <div>
            <Input.Search
              placeholder="输入手机号或姓名"
              enterButton="搜索"
              onSearch={value => {
                const args = {};
                if (value) {
                  if (/^\d+/g.test(value)) {
                    args.mobile = value;
                    args.name = undefined;
                  } else {
                    args.name = value;
                    args.mobile = undefined;
                  }
                } else {
                  args.name = undefined;
                  args.mobile = undefined;
                }
                router.replace({pathname, query: {...query, ...args}});
              }}
            />
          </div>
        }
      >

      </ListPage>
    )
  }
}
