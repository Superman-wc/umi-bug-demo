import React, {Component} from 'react';
import {Modal, Table, Radio} from 'antd';
import RadioSelector from './RadioSelector';
import styles from './index.less';
import {list as fetchCourseList} from '../../services/manages/course';
import {list as fetchTeacherList} from '../../services/manages/teacher';
import {paginationConfig, stdColumns} from '../ListPage';


export default class SubstituteModal extends Component {

  state = {};

  onGradeChange = (e) => {
    const gradeId = e.target.value;
    fetchCourseList({gradeId}).then(({result: {list}}) => {
      this.setState({gradeId, courseList: list});
    });
  };

  onCourseChange = (e) => {
    const courseId = e.target.value;
    const {gradeId} = this.state;
    console.log(this.props);
    const {lecture: {id}} = this.props;
    fetchTeacherList({gradeId, courseId, lectureId: id}).then(({result: {list}}) => {
      this.setState({courseId, teacherList: list.sort((a, b) => a.workStatus - b.workStatus)});
    })
  };

  onSelectedTeacherChange = (e) => {
    this.setState({teacherId: e.target.value});
  };

  render() {
    const {gradeList, visible, onOk, onCancel} = this.props;
    const {courseList, teacherList} = this.state;

    const modalProps = {
      title: '代课',
      width: 800,
      visible, onCancel,
      onOk: () => {
        const {lecture: {id}} = this.props;
        onOk && onOk({
          id,
          teacherId: this.state.teacherId,
          courseId: this.state.courseId
        })
      }
    };

    const columns = [
      {key: 'id', title: 'ID'},
      {key: 'name', title: '教师'},
      {key: 'workStatus', title: '是否有课', render: v => v === 2 ? '没课' : '有课'},
      {
        key: 'operation',
        title: '操作',
        render: (id, item) => <Radio value={id} disabled={item.workStatus !== 2}>选择</Radio>
      }
    ];
    return (
      <Modal {...modalProps}>
        <RadioSelector title="年级" options={gradeList} onChange={this.onGradeChange}/>
        {
          this.state.gradeId && courseList && courseList.length ?
            <RadioSelector title="科目" options={courseList} onChange={this.onCourseChange}/>
            :
            null
        }
        <Radio.Group name="selected" style={{display: 'block'}} onChange={this.onSelectedTeacherChange}>
          <Table
            className="list-table"
            bordered
            columns={stdColumns(columns)}
            dataSource={Array.isArray(teacherList) ? teacherList : []}
            pagination={false}
            rowKey="id"
          />
        </Radio.Group>
      </Modal>
    );
  }
}
