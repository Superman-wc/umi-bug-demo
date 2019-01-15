import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Select, notification, Button} from 'antd';

import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';

import TimeTable from '../../../components/Timetable/CourseTable';
import LectureModal from '../../../components/Timetable/LectureModal';
import Flex from '../../../components/Flex';
import {
  ManagesClass, ManagesCourse,
  ManagesGrade,
  ManagesPeriod,
  ManagesRoom,
  TimetableBuild as namespace
} from "../../../utils/namespace";


@connect(state => ({
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  roomList: state[ManagesRoom].list,
  periodList: state[ManagesPeriod].list,
  courseList: state[ManagesCourse].list,
  klassList: state[ManagesClass].list,
  lectureList: state[namespace].list,
  gradeId: state[namespace].gradeId,
  selectedLecture: state[namespace].selectedLecture
}))
export default class BuildTimeTable extends Component {

  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: ManagesGrade + '/list'
    });
    this.props.dispatch({
      type: ManagesRoom + '/list',
      payload: {s: 10000}
    });
  }

  onGradeChange = gradeId => {
    this.props.dispatch({
      type: namespace + '/set',
      payload: {gradeId}
    });
    this.props.dispatch({
      type: namespace + '/list',
      payload: {
        gradeId,
        s: 10000,
      }
    });
    this.props.dispatch({
      type: ManagesClass + '/list',
      payload: {
        gradeId,
        s: 10000,
      }
    });
    this.props.dispatch({
      type: ManagesCourse + '/list',
      payload: {
        gradeId,
        s: 10000,
      }
    });
    this.props.dispatch({
      type: ManagesPeriod + '/list',
      payload: {
        gradeId,
        s: 1000,
      },
    });
  };

  render() {
    const {
      location, dispatch, loading,
      selectedLecture,
      gradeList = [], roomList = [], periodList = [], courseList = [], klassList = [], lectureList = [], gradeId
    } = this.props;

    const {pathname, query} = location;

    const title = '构建课表';

    const breadcrumb = ['排课', '课表', title];


    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const buttons = [
      {
        key:'rollback'
      }
    ];

    if (selectedLecture && gradeId) {
      buttons.push({
        key: 'edit', children: '编辑', onClick: () => {
          this.setState({lectureModalVisible: true});
        }
      });
      if (typeof selectedLecture.id === 'number') {
        buttons.push({
          key: 'remove', children: '删除', onClick: () => {
            dispatch({
              type: namespace + '/remove',
              payload: {id: selectedLecture.id},
              resolve: () => {
                notification.success({
                  message: '删除成功'
                })
              }
            })
          }
        })
      }
    }
    if (gradeId) {
      buttons.push({
        key: 'refresh', children: '刷新', onClick: () => {
          this.props.dispatch({
            type: namespace + '/list',
            payload: {
              gradeId,
              s: 10000,
            }
          });
        }
      });
    }
    const timetableProps = {
      gradeList,
      roomList,
      periodList,
      lectureList,
      gradeId,
      dispatch,
      selectedLecture,
      onSelect: (selectedLecture) => {
        dispatch({
          type: namespace + '/set',
          payload: {
            selectedLecture
          }
        })
      },
      onEdit: (selectedLecture) => {
        dispatch({
          type: namespace + '/set',
          payload: {
            selectedLecture
          }
        });
        this.setState({lectureModalVisible: true});
      }
    };

    return (
      <Page header={header} loading={loading}>
        <Flex direction="column">
          <Flex align="middle" style={{height: 50, padding: '5px 10px', background: '#eee',}}>
            <Form layout="inline">
              <Form.Item label="年级">
                <Select placeholder="请选择" onChange={this.onGradeChange} style={{width: 120}}>
                  {
                    gradeList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              </Form.Item>
            </Form>
            {
              buttons.length ?
                <Button.Group>
                  {
                    buttons.map(it =>
                      <Button {...it} />
                    )
                  }
                </Button.Group>
                :
                null
            }
          </Flex>
          <TimeTable {...timetableProps}/>
        </Flex>
        <LectureModal
          visible={this.state.lectureModalVisible}
          lecture={selectedLecture}
          gradeId={gradeId}
          klassList={klassList}
          courseList={courseList}
          onCancel={() => this.setState({lectureModalVisible: false})}
          onOk={payload => {
            payload.gradeId = gradeId;
            payload.roomId = selectedLecture.room.id;
            payload.periodId = selectedLecture.period.id;
            if (typeof  selectedLecture.id === 'number') {
              payload.id = selectedLecture.id
            }
            console.log(
              payload,
              selectedLecture
            );
            this.props.dispatch({
              type: namespace + (payload.id ? '/modify' : '/create'),
              payload,
              resolve: () => {
                notification.success({
                  message: payload.id ? '修改成功' : '创建成功'
                })
              }
            });
            this.setState({lectureModalVisible: false})
          }}
        />
      </Page>

    );
  }
}
