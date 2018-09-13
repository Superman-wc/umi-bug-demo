import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Radio} from 'antd';
import {TimetableClass as namespace,  ManagesGrade, ManagesClass} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import { transformTimetableList, RadioSelector, Timetable} from '../../../components/Timetable';
import styles from '../index.less';


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  classList: state[ManagesClass].list,
}))
export default class MeterList extends Component {

  state = {};

  componentDidMount() {
    const {gradeList} = this.props;
    if (!gradeList || !gradeList.length) {
      this.fetchGradeList();
    }
  }

  fetchGradeList = () => {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list'
    });
  };

  fetchClassList = (payload) => {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesClass + '/list',
      payload
    });
  };

  onGradeChange = e => {
    const gradeId = e.target.value;
    this.fetchClassList({gradeId});
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({pathname, query: {...query, gradeId, klassId: undefined}}));
    dispatch({
      type: namespace + '/set',
      payload: {list: []}
    });
  };

  onClassChange = e => {
    const klassId = e.target.value;
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({pathname, query: {...query, klassId}}));
  };

  render() {
    const {
      list = [], total, loading,
      gradeList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '班级课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    return (
      <Page header={header} loading={!!loading}>
        <div className="list-page-main">
          <div className="list-table-container">
            <RadioSelector title="年级" options={gradeList} onChange={this.onGradeChange}/>
            {
              query.gradeId && classList && classList.length ?
                <RadioSelector title="班级" options={classList} onChange={this.onClassChange}/>
                :
                null
            }
            {
              query.gradeId && query.klassId && classList && classList.length && list && list.length ?
                <Timetable {...transformTimetableList(list)}/>
                :
                null
            }
          </div>
        </div>
      </Page>

    );
  }
}
