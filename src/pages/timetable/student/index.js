import React, {Component} from 'react';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import WeekTimeTable from '../../../components/Timetable/WeekTimeTable';
import {connect} from 'dva';
import {TimetableStudent as namespace} from "../../../utils/namespace";

@connect(state => ({
  list: state[namespace].list,
  now: state[namespace].now,
  loading: state[namespace].loading,
}))
export default class StudentTimeTable extends Component {

  render() {
    const {location, dispatch, list, now, loading} = this.props;

    const {pathname, query} = location;

    const title = '学生课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const timeTableProps = {
      list, now, loading, dispatch, namespace,
      type: 'student'
    };

    return (
      <Page header={header}>
        <div className="list-page-main">
          <div className="list-table-container">
            <WeekTimeTable {...timeTableProps}/>
          </div>
        </div>
      </Page>
    );
  }
}



