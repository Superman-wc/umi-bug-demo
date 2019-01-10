import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input, notification} from 'antd';
import {
  ManagesStudentArrangePlan as namespace
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import router from "umi/router";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
export default class ArrangePlanList extends Component {

  state = {};

  render() {
    const {list, total, loading, location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '分班方案';

    const breadcrumb = ['选班排课', title];

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

    const columns = [
      // {title: 'ID', key: 'id'},
      {title: '方案名称', key: 'name', width: 300,},
      {title: '类型', key: 'electionExamination', render: v => v ? '选考' : '学考'},
      {title: '年级', key: 'gradeName', width:120},
      {title: '创建时间', key: 'dateCreated'},

      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              look: () => router.push({pathname: pathname + '/' + id, query}),
              // remove: {
              //   onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              // },
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
      >

      </ListPage>
    );
  }
}


