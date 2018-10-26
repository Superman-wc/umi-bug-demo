import React, {Component} from 'react';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import WeekTimeTable from '../../../components/Timetable';


export default class KlassTimeTable extends Component {

  render() {
    const { location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '班级课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    return (
      <Page header={header}>
        <div className="list-page-main">
          <div className="list-table-container">
            <WeekTimeTable type="klass"/>
          </div>
        </div>
      </Page>
    );
  }
}



