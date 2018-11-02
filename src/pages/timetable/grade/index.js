import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import RoomWeekTimeTable from '../../../components/Timetable/RoomWeekTimeTable';
import {TimetableGrade as namespace} from "../../../utils/namespace";

@connect(state => ({
  list: state[namespace].list,
  now: state[namespace].now,
  loading: state[namespace].loading,
  item: state[namespace].item,
}))
export default class GradeTimeTable extends Component {

  state = {};


  render() {
    const {location, dispatch, list, now, loading, item} = this.props;

    const {pathname, query} = location;

    const title = '年级课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const timetableProps = {
      list, now, loading, item, dispatch,namespace,
      type: 'grade'
    };

    return (
      <Page header={header} loading={false}>
        <div className="list-page-main">
          <div className="list-table-container">
            <RoomWeekTimeTable {...timetableProps}/>
          </div>
        </div>
      </Page>

    );
  }
}
