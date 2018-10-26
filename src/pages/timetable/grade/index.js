import React, {Component} from 'react';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import RoomWeekTimeTable from '../../../components/Timetable/RoomWeekTimeTable';


export default class GradeTimeTable extends Component {

  state = {};


  render() {
    const {location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '年级课表';

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
            <RoomWeekTimeTable type="grade"/>
          </div>
        </div>
      </Page>

    );
  }
}
