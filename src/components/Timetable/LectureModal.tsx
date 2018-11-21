import React, {Component, Fragment} from 'react';
import Proptypes from 'prop-types';
import {connect} from 'dva';
import classnames from 'classnames';
import {Modal, Form, Select, Input, Button, notification} from 'antd';
import {FormComponentProps} from 'antd/lib/form';
import {ICourse, IKlass, ILecture, ITeacher} from "@/components/Timetable/interface";
import {ManagesTeacher} from '../../utils/namespace';

export type LectureModalProps = {
  lecture: ILecture;
  gradeId: number;
  visible: boolean;
  klassList: IKlass[];
  courseList: ICourse[];
  // teacherList: ITeacher[];
  onCancel: () => void;
  onOk: (payload: ILecture) => void;
  // dispatch: (action: { type: string, payload: any }) => void;
} & FormComponentProps


class LectureModal extends Component<LectureModalProps, any> {

  static propTypes = {
    lecture: Proptypes.object,
    gradeId: Proptypes.number,
    visible: Proptypes.bool,
    klassList: Proptypes.array,
    courseList: Proptypes.array,
    // teacherList: Proptypes.array,
    onCancel: Proptypes.func,
    onOk: Proptypes.func,
  };


  state = {
    courseId: undefined,
    teacherList: []
  };

  fetchTeacherList = (courseId) => {
    // this.props.dispatch({
    //   type: ManagesTeacher + '/list',
    //   payload: {
    //     gradeId: this.props.gradeId,
    //     courseId,
    //     s: 10000,
    //   }
    // });
    const course = this.props.courseList.find((it: ICourse) => it.id === courseId);
    if (course) {
      this.setState({teacherList: course.teacherList});
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.lecture && nextProps.lecture !== this.props.lecture) {
      if (nextProps.lecture.course && nextProps.lecture.course.id) {
        this.fetchTeacherList(nextProps.lecture.course.id);
        this.setState({courseId: nextProps.lecture.course.id});
      } else {
        this.setState({courseId: null});
      }
    }
  }

  render() {
    const {
      visible, onCancel, onOk, lecture,
      klassList = [], courseList = [],
      // teacherList = [],
      form: {getFieldDecorator, validateFieldsAndScroll, setFields, getFieldValue}
    } = this.props;

    const selectStyle = {width: '100%'};

    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };

    const {teacherList = []} = this.state;

    return (
      <Modal title={lecture && typeof lecture.id === 'number' ? "修改课表" : '创建课表'} visible={visible} onCancel={onCancel}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.error(errors)
                 } else {
                   if (!payload.reserveName && !payload.courseId) {
                     setFields({
                       courseId: {errors: [new Error('学科与其他必须填写一个')]},
                       reserveName: {errors: [new Error('学科与其他必须填写一个')]}
                     })
                   } else if (payload.courseId && payload.reserveName) {
                     setFields({
                       courseId: {value: payload.courseId, errors: [new Error('学科与其他只能填写一个')]},
                       reserveName: {value: payload.reserveName, errors: [new Error('学科与其他只能填写一个')]}
                     })
                   } else if (payload.courseId) {
                     if (!payload.teacherId) {
                       setFields({
                         teacherId: {errors: [new Error('请选择一个授课教师')]}
                       })
                     } else {
                       onOk(payload);
                     }
                   } else if (payload.reserveName) {
                     onOk(payload);
                   }
                 }
               })
             }}
      >
        <Form layout="horizontal">
          <Form.Item label="班级" {...wrapper}>
            {
              getFieldDecorator('klassId', {
                rules: [{message: '请选择班级', required: true}]
              })(
                <Select placeholder="请选择" style={selectStyle}>
                  {
                    klassList.map(it =>
                      <Select.Option key={it.id.toString()} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="课程" {...wrapper}>
            {
              getFieldDecorator('courseId', {})(
                <Select placeholder="请选择" onChange={(courseId) => {

                  this.setState({courseId});
                  this.fetchTeacherList(courseId);


                  setFields({
                    courseId: {value: courseId, errors: null},
                    reserveName: {errors: null},
                  })

                }} style={selectStyle}>
                  {
                    courseList.map(it =>
                      <Select.Option key={it.id.toString()} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="教师"  {...wrapper}>
            {
              getFieldDecorator('teacherId', {})(
                <Select placeholder={this.state.courseId ? '请选择' : '请先选择科目'} style={selectStyle}>
                  {
                    this.state.courseId && teacherList.map((it:ITeacher) =>
                      <Select.Option key={it.id.toString()} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="其他" {...wrapper}>
            {
              getFieldDecorator('reserveName', {})(
                <Input placeholder="如果是班会、自修" onChange={(value) => {
                  const teacherId = getFieldValue('teacherId');
                  setFields({
                    courseId: {errors: null},
                    reserveName: {value, errors: null},
                    teacherId: {value: teacherId, errors: null},
                  })
                }}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props: LectureModalProps) => {
    return {
      klassId: Form.createFormField({value: props.lecture && props.lecture.klass && props.lecture.klass.id || undefined}),
      courseId: Form.createFormField({value: props.lecture && props.lecture.course && props.lecture.course.id || undefined}),
      teacherId: Form.createFormField({value: props.lecture && props.lecture.teacher && props.lecture.teacher.id || undefined}),
      reserveName: Form.createFormField({value: props.lecture && props.lecture.reserveName || undefined}),
    }
  }
})(connect(state => ({
  // teacherList: state[ManagesTeacher].list,
}))(LectureModal))
