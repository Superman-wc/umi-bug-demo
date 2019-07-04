import React, {Component} from 'react';
import {connect} from 'dva';
import {ManagesLectureArrangePlan as namespace} from '../../../utils/namespace';
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

    const title = '排课方案';

    const breadcrumb = ['选班排课', title];

    const buttons = [
      {
        key: 'rollback'
      }
    ];

    const columns = [
      // {title: 'ID', key: 'id'},
      {title: '方案名称', key: 'name', width: 300,},
      {title: '选考分班', key: 'electionExaminationPlanName', width: 200,},
      {title: '学考分班', key: 'studyExaminationPlanName', width: 200,},
      {title: '年级', key: 'gradeName', width: 120,},
      {title: '创建时间', key: 'dateCreated'},

      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              look: () => router.push({pathname: pathname + '/' + id, query}),
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


