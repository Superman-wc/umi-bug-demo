import React, {Component} from 'react';
import {Modal, Table, Radio} from 'antd';
import RadioSelector from './RadioSelector';
import styles from './index.less';
import {list as fetchCourseList} from '../../services/manages/course';
import {list as fetchTeacherList} from '../../services/manages/teacher';
import { stdColumns} from '../ListPage';
import Filter from './Filter';


export default class SubstituteModal extends Component {

  state = {};

  onFilterChange = (type, {gradeId, courseId})=>{
    if(type === 'grade'){
      this.setState({teacherList: [], courseId:null});
    }else if(type === 'course') {
      const {lecture: {id}} = this.props;
      fetchTeacherList({gradeId, courseId, lectureId: id}).then(({result: {list}}) => {
        this.setState({courseId, teacherList: list.sort((a, b) => a.workStatus - b.workStatus)});
      })
    }
  };

  onSelectedTeacherChange = (e) => {
    this.setState({teacherId: e.target.value});
  };

  render() {
    const { visible, onOk, onCancel} = this.props;
    const { teacherList} = this.state;

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
      {key: 'workCountOfWeek', title: '本周课时', render: v => v + '节课'},
      {key: 'workStatus', title: '是否有课', render: v => v === 2 ? '没课' : '有课'},
      {
        key: 'operation',
        title: '操作',
        render: (id, item) => <Radio value={id} disabled={item.workStatus !== 2}>选择</Radio>
      }
    ];
    return (
      <Modal {...modalProps}>
        <Filter type="course" onChange={this.onFilterChange} />
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
