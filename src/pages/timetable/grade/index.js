import React, {Component} from 'react';
import {connect} from 'dva';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import {ManagesPeriod, TimetableGrade as namespace} from "../../../utils/namespace";
import Filter from '../../../components/Timetable/Filter';
import TimeTable from '../../../components/Timetable/CourseTable';
import Flex from '../../../components/Flex';

@connect(state => ({
  list: state[namespace].list,
  now: state[namespace].now,
  loading: state[namespace].loading,
  item: state[namespace].item,
  periodList: state[ManagesPeriod].list,
}))
export default class GradeTimeTable extends Component {

  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: ManagesPeriod + '/list',
      payload: {
        s: 1000,
      },
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: namespace + '/set',
      payload: {
        list: []
      }
    })
  }

  onFilterChange = (changeType, {gradeId, type, weekIndex}) => {
    if (gradeId && type) {
      this.setState({gradeId});
      this.props.dispatch({
        type: namespace + '/list',
        payload: {
          gradeId, type, weekIndex
        }
      })
    }
  };

  render() {
    const {location, dispatch, list = [], now, loading, item, periodList = []} = this.props;

    const {pathname, query} = location;

    const title = '年级课表';

    const breadcrumb = ['排课', '课表', title];

    const buttons = [
      {
        key:'rollback'
      }
    ];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const roomList = Object.values(list.reduce((map, it) => {
      if (it.room) {
        map[it.room.id] = it.room;
      }
      return map;
    }, {}));

    const timetableProps = {
      now,
      periodList,
      roomList,
      lectureList: list,
      gradeId: this.state.gradeId,
      selectedLecture: this.state.selectedLecture,
      onSelect: (selectedLecture) => {
        this.setState({selectedLecture});
      },
    };

    console.log(timetableProps);

    return (
      <Page header={header} loading={!!loading}>
        <Flex direction="column">
          <Flex align="middle" style={{height: 50, padding: '5px 10px', background: '#eee',}}>
            <Filter type="grade" onChange={this.onFilterChange}/>
          </Flex>
          <TimeTable {...timetableProps}/>
        </Flex>
      </Page>

    );
  }
}
