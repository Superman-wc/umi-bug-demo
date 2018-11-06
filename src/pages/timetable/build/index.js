import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';

import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';

import TimeTable from '../../../components/Timetable/CourseTable';
import {TimetableBuild as namespace} from "../../../utils/namespace";


@connect(state => ({
  loading: state[namespace].loading,
}))
export default class GradeTimeTable extends Component {

  state = {};


  render() {
    const {
      location, dispatch, loading

    } = this.props;

    const {pathname, query} = location;

    const title = '构建课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );


    return (
      <Page header={header} loading={loading}>
        <TimeTable/>
      </Page>

    );
  }
}
