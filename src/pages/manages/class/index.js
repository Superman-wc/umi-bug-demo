import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal} from 'antd';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {ManagesClass as namespace, ManagesStudent} from '../../../utils/namespace';
import styles from './index.less';

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading
}))
export default class MeterList extends Component {

  state = {};

  render() {
    const {list, total, loading, location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '班级列表';

    const breadcrumb = ['管理', '班级管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: null});
        },
      },
    ];

    const ClassTypeEnum = {
      1: '行政班',
      3: '选考班',
      4: '学考班',
    };

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '班级名称', key: 'name', width: 180,},
      {title: '类型', key: 'type', width: 180, render: type => ClassTypeEnum[type] || ''},
      {title: '创建时间', key: 'dateCreated', width: 180},
      {title: '备注', key: 'memo', width: 'auto', tac: false},
      {
        title: '操作',
        key: 'operate',
        width: 180,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              look: () => dispatch(routerRedux.push({pathname: ManagesStudent, query: {gradeId: id}})),
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
