import React, {Component, Fragment} from 'react';
import {Form, Select, DatePicker} from 'antd';
import Moment from 'moment';

import {list as fetchStudentList} from "../../services/manages/student";
import {list as fetchKlassList} from "../../services/manages/class";
import {list as fetchGradeList} from "../../services/manages/grade";
import {list as fetchTeacherList} from "../../services/manages/teacher";
import {list as fetchCourseList} from "../../services/manages/course";

/**
 * 可根据年级、班级、科目、教师、学生进行筛选操作
 */
export default class Filter extends Component {

  state = {
    week: new Moment()
  };

  componentDidMount() {
    this.fetchGradeList();
  }

  fetchGradeList = () => {
    fetchGradeList().then(({result: {list}}) => {
      this.setState({gradeList: list});
    })
  };

  fetchKlassList = (gradeId) => {
    fetchKlassList({gradeId}).then(({result: {list}}) => {
      this.setState({klassList: list});
    });
  };

  fetchCourseList = (gradeId) => {
    fetchCourseList({gradeId}).then(({result: {list}}) => {
      this.setState({courseList: list});
    });
  };

  fetchTeacherList = (gradeId, courseId) => {
    fetchTeacherList({gradeId, courseId}).then(({result: {list}}) => {
      this.setState({teacherList: list});
    });
  };

  fetchStudentList = (gradeId, klassId) => {
    fetchStudentList({gradeId, klassId}).then(({result: {list}}) => {
      this.setState({studentList: list});
    });
  };


  onGradeChange = gradeId => {
    this.setState({
      gradeId,
      klassList: [], courseList: [], teacherList: [], studentList: [],
      klassId: undefined, courseId: undefined, teacherId: undefined, studentId: undefined, type: undefined
    });
    // 如果是教师课表或科目筛选
    if (this.props.type === 'teacher' || this.props.type === 'course') {
      this.fetchCourseList(gradeId);
    }
    // 如果是班级课表或学生课表
    else if (this.props.type === 'klass' || this.props.type === 'student') {
      this.fetchKlassList(gradeId);
    }

    const {week} = this.state;

    this.props.onChange && this.props.onChange('grade', {gradeId, weekIndex: week.format('YYYYWW')});

  };

  onKlassChange = klassId => {
    this.setState({
      klassId,
      studentList: [],
      studentId: undefined
    });
    const {gradeId, week} = this.state;
    if (this.props.type === 'student') {
      this.fetchStudentList(gradeId, klassId);
    }
    // else if (this.props.type === 'klass' && this.props.onChange) {
    //   this.props.onChange({gradeId, klassId});
    // }
    this.props.onChange && this.props.onChange('klass', {gradeId, klassId, weekIndex: week.format('YYYYWW')});
  };

  onCourseChange = courseId => {
    this.setState({
      courseId,
      teacherList: [],
      teacherId: undefined,
    });
    const {gradeId} = this.state;
    if (this.props.type === 'teacher') {
      this.fetchTeacherList(gradeId, courseId);
    }
    // else if (this.props.type === 'course' && this.props.onChange) {
    //   this.props.onChange({gradeId, courseId});
    // }
    this.props.onChange && this.props.onChange('course', {gradeId, courseId});
  };

  onTeacherChange = teacherId => {
    this.setState({teacherId});
    if (this.props.type === 'teacher' && this.props.onChange) {
      const {gradeId, courseId, week} = this.state;
      this.props.onChange('teacher', {gradeId, courseId, teacherId, weekIndex: week.format('YYYYWW')});
    }
  };

  onStudentChange = studentId => {
    this.setState({studentId});
    if (this.props.type === 'student' && this.props.onChange) {
      const {gradeId, week} = this.state;
      this.props.onChange('student', {gradeId, studentId, weekIndex: week.format('YYYYWW')});
    }
  };

  onWeekIndexChange = week => {
    this.setState({week});
    const {gradeId, courseId, klassId, studentId, teacherId} = this.state;
    this.props.onChange('week', {weekIndex: week.format('YYYYWW'), gradeId, courseId, klassId, studentId, teacherId});
  };

  onTypeChange = type => {
    this.setState({type});
    const {gradeId, week} = this.state;
    this.props.onChange('type', {weekIndex: week.format('YYYYWW'), gradeId, type});
  };

  render() {

    const {type} = this.props;

    const {
      gradeList = [], klassList = [], courseList = [], teacherList = [], studentList = [],
      gradeId, klassId, courseId, teacherId, studentId
    } = this.state;

    const selectStyle = {width: 120};

    return (
      <Form layout="inline">
        <Form.Item label="年级">
          <Select placeholder="请选择" value={gradeId} onChange={this.onGradeChange} style={selectStyle}>
            {
              gradeList.map(it =>
                <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
              )
            }
          </Select>
        </Form.Item>
        {
          type === 'klass' || type === 'student' ?
            <Fragment>
              <Form.Item label="班级">
                <Select placeholder={gradeId ? '请选择' : '请先选择年级'} value={klassId} onChange={this.onKlassChange}
                        style={selectStyle}>
                  {
                    klassList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              </Form.Item>
              {
                type === 'student' ?
                  <Form.Item label="学生">
                    <Select placeholder={gradeId ? klassId ? '请选择' : '请先选择班级' : '请先选择年级'} value={studentId}
                            onChange={this.onStudentChange} style={selectStyle}>
                      {
                        studentList.map(it =>
                          <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                        )
                      }
                    </Select>
                  </Form.Item>
                  :
                  null
              }
            </Fragment>
            :
            type === 'course' || type === 'teacher' ?
              <Fragment>
                <Form.Item label="科目">
                  <Select placeholder={gradeId ? '请选择' : '请先选择年级'} value={courseId} onChange={this.onCourseChange}
                          style={selectStyle}>
                    {
                      courseList.map(it =>
                        <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                      )
                    }
                  </Select>
                </Form.Item>
                {
                  type === 'teacher' ?
                    <Form.Item label="教师">
                      <Select placeholder={gradeId ? courseId ? '请选择' : '请先选择科目' : '请先选择年级'} value={teacherId}
                              onChange={this.onTeacherChange} style={selectStyle}>
                        {
                          teacherList.map(it =>
                            <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                          )
                        }
                      </Select>
                    </Form.Item>
                    :
                    null
                }
              </Fragment>
              :
              null
        }
        {
          type === 'grade' ?
            <Form.Item label="分类">
              <Select placeholder={gradeId ? '请选择' : '请先选择年级'} value={this.state.type}
                      onChange={this.onTypeChange} style={selectStyle}>
                {
                  gradeId ?
                    [
                      {id: 1, name: '行政班'},
                      {id: 2, name: '教学班'},
                      {id: 3, name: '全部'},
                    ].map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                    :
                    null
                }
              </Select>
            </Form.Item>
            :
            null
        }
        {
          type !== 'course' ?
            <Form.Item label="时间">
              <DatePicker.WeekPicker value={this.state.week} onChange={this.onWeekIndexChange}/>
            </Form.Item>
            :
            null
        }

      </Form>
    )
  }
}