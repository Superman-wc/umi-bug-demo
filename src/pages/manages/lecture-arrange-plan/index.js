import React, {Component} from 'react';
import {connect} from 'dva';
import {ManagesLectureArrangePlan as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import router from "umi/router";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state.loading.models[namespace],
}))
export default class LectureArrangePlanList extends Component {

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
      {title: '方案名称', key: 'name', width: '25%', tac:false},
      {title: '选考分班', key: 'electionExaminationPlanName', width: '18%', tac:false},
      {title: '学考分班', key: 'studyExaminationPlanName', width: '18%', tac:false},
      {title: '年级', key: 'gradeName', width: '15%',},
      {title: '创建时间', key: 'dateCreated', width:'18%', },
      {
        title: '操作', width:100, key: 'operate',
        render: (id) => (
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


