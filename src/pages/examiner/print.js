import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import {Form, Modal, notification, Cascader} from 'antd';
import {
  AnswerEditor as namespace,
  ManagesGrade, ManagesSubject, ManagesClass,
} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import TableCellOperation from '../../components/TableCellOperation';
import {BuildingTypeEnum, ClassTypeEnum, Enums, AnswerCardTypeEnum} from "../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
export default class ExaminerAnswerListPage extends Component {

  state = {};

  render() {
    const {
      list, total, loading, location, dispatch,
    } = this.props;

    const {pathname, query} = location;

    const title = '打印列表';

    const breadcrumb = ['管理', '打印管理', title];

    const buttons = [
      {
        key: 'refresh',
        type: 'primary',
        children: '刷新',
        title: '刷新',
        icon: 'refresh',
        onClick: () => {

        },
      },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: '文件名', key: 'title', width: 250},
      {title: '打印份数', key: 'count', },
      {title: '打印要求', key: 'requirement',},
      {title: '申请教师', key: 'teacherName',},
      {title: '状态', key: 'status'},
      {title: '创建时间', key: 'dateCreated',},
      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => {
                router.push({pathname: namespace + '/editor', query: {id}});
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
      />
    );
  }
}
