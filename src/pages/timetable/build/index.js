import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import BuildRoomWeekTimeTable from '../../../components/Timetable/BuildRoomWeekTimeTable';
import {ManagesRoom, TimetableLecture} from "../../../utils/namespace";

@connect(state => ({

}))
export default class GradeTimeTable extends Component {

  state = {};

  componentDidMount() {


  }


  render() {
    const {location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '构建课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );


    return (
      <Page header={header} loading={false}>
        <div className="list-page-main">
          <div className="list-table-container">
            <BuildRoomWeekTimeTable />
          </div>
        </div>
      </Page>

    );
  }
}
