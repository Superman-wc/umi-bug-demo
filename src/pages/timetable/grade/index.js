import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Radio} from 'antd';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from '../index.less';
import LectureTable from '../../../components/Timetable/LectureTable';


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
            <LectureTable type="grade"/>
          </div>
        </div>
      </Page>

    );
  }
}
