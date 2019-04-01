import { Table, Button, notification } from 'antd';
import React from 'react';
import moment from 'moment';
import StudentModal from './StudentModal';
import TeacherSelectTableModal from './TeacherSelectModal'
import styles from './exam.less'
import { ExamDetail as namespace } from '../../utils/namespace';
import { connect } from 'dva';

@connect()
export default class ExamTable extends React.Component {

  state = {
    teacherList: null,
    bordered: true
  };

  render() {
    const { examDetail = {}, examinationId, canEdit, searchValue } = this.props;
    const { arrangeList = [], periodList = [], roomList = [] } = examDetail;
    const columns = [
      {
        title: 'ID',
        dataIndex: 'rowIndex',
        key: 'rowIndex',
        width: 60,
        align: 'center',
        render: (text, record, index) => record.roomPriorityNum
      },
      {
        title: '考场',
        dataIndex: 'roomName',
        key: 'roomPriorityNum',
        align: 'center'
      },
    ];
    periodList.map((it) => {
      // record.startDay ? moment(record.startDay).format('YYYY-MM-DD') : '-'
      const startTime = it.startTime ? moment(it.startTime).format('HH:mm') : '-';
      const endTime = it.startTime ? moment(it.endTime).format('HH:mm') : '-';
      const item = {
        title: it.startTime ? moment(it.startTime).format('YYYY-MM-DD') : '-',
        children: [
          {
            title: `${startTime}-${endTime}`,
            children: [
              {
                title: it.name || '-',
                dataIndex: 'name' + it.examinationSubjectId,
                key: 'id' + it.examinationSubjectId,
                align: 'center',
                render: (text, record, index) => {
                  const teacherName = record[`name${it.examinationSubjectId}`];
                  if (teacherName) {
                    const subjectName = record[`subjectName${it.examinationSubjectId}`];
                    const roomName = record['roomName'];
                    const placeId = record[`placeId${it.examinationSubjectId}${index}`];
                    let btnType = '';
                    if (searchValue) {
                      if (teacherName.indexOf(searchValue) !== -1) {
                        btnType = 'primary';
                      }
                    }
                    return <div>
                      <Button
                        type={btnType}
                        size='default'
                        onClick={() => {
                          if (canEdit) {
                            this.setState({
                              teacherModalVisible: true,
                              teacherModalTitle: `安排监考--${subjectName}-${roomName}`,
                              examinationSubjectId: it.examinationSubjectId,
                              placeId
                            });
                          } else {
                            notification.warning({
                              message: '不可修改',
                              description: '已发布不可修改，如需修改请先下线'
                            })
                          }
                        }}>{teacherName}</Button>
                      <br />
                      <Button
                        className={styles['studentButton']}
                        size='small'
                        onClick={() => {
                          this.setState({
                            studentModalVisible: true,
                            studentModalTitle: `学生名单--${subjectName}-${roomName}-${teacherName}`,
                            placeId
                          });
                        }}>考生名单</Button>
                    </div>;
                  } else {
                    return '';
                  }
                }
              }],
          }],
      };
      columns.push(item);
    });

    const data = [];
    roomList.sort((a, b) => a.roomPriorityNum - b.roomPriorityNum);
    roomList.map((it, index) => {
      const item = {
        rowIndex: index,
        roomId: it.roomId || index,
        roomName: it.name || '-' + index,
        roomPriorityNum: it.roomPriorityNum || index
      };
      periodList.map((period) => {
        item[`id${period.examinationSubjectId}`] = 'id' + period.examinationSubjectId;
        item[`subjectName${period.examinationSubjectId}`] = period.name;
        arrangeList.map((arrange) => {
          if ((arrange.examinationSubjectId == period.examinationSubjectId) && (arrange.roomId == it.roomId)) {
            if (arrange.teacherList && arrange.teacherList.length > 0) {
              let teachers = '';
              arrange.teacherList.map((teacher) => {
                teachers += `${teacher.name}/`;
              })
              var str = teachers.substring(0, teachers.length - 1);
              item[`name${arrange.examinationSubjectId}`] = str;
              item[`placeId${arrange.examinationSubjectId}${index}`] = arrange.examinationPlaceId;
            } else {
              if (arrange.studentNum !== 0) {
                item[`name${arrange.examinationSubjectId}`] = '添加';
                item[`placeId${arrange.examinationSubjectId}${index}`] = arrange.examinationPlaceId;
              }
            }
            return;
          }
        })
      });
      data.push(item);
    });

    return (
      <div>
        <Table
          rowKey={record => record.roomId}
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered={this.state.bordered}
        />
        <StudentModal visible={this.state.studentModalVisible}
          title={this.state.studentModalTitle}
          placeId={this.state.placeId}
          onCancel={() => {
            this.setState({ studentModalVisible: false });
          }}
        />
        <TeacherSelectTableModal visible={this.state.teacherModalVisible}
          title={this.state.teacherModalTitle}
          monitorNum={examDetail.monitorNum}
          examinationId={examinationId}
          handleClickName={() => {
            this.setState({ teacherModalVisible: false });
            this.props.dispatch({
              type: namespace + '/examDetail',
              payload: {
                id: this.props.examinationId
              }
            })
          }}
          handleMultiClick={(teacherMap) => {// 多选
            let strs = '';
            teacherMap.forEach((it, key) => {
              strs += (key + ',')
            })
            let teachers = '';
            if (strs.length > 0) {
              teachers = strs.substring(0, strs.length - 1);
            }
            this.state.teacherList = teachers;
            console.log('strs: ', teachers);
          }}
          examinationSubjectId={this.state.examinationSubjectId}
          examinationPlaceId={this.state.placeId}
          onCancel={() => {
            this.setState({ teacherModalVisible: false });
          }}
          onClear={() => {// 清空监考
            this.props.dispatch({
              type: namespace + '/removeTeacherInDetail',
              payload: {
                examinationPlaceId: this.state.placeId
              },
              resolve: () => {
                this.props.dispatch({
                  type: namespace + '/examDetail',
                  payload: {
                    id: this.props.examinationId
                  }
                })
              }
            })
            this.setState({ teacherModalVisible: false });
          }}
          onOk={() => {
            if (this.state.teacherList) {
              this.props.dispatch({
                type: namespace + '/updateTeacherInDetail',
                payload: {
                  examinationPlaceId: this.state.placeId,
                  teacherList: this.state.teacherList
                },
                resolve: () => {
                  notification.success({ message: '分配教师成功' });
                  this.props.dispatch({
                    type: namespace + '/examDetail',
                    payload: {
                      id: this.props.examinationId
                    }
                  })
                  this.setState({ teacherModalVisible: false });
                }
              })
            } else {
              this.setState({ teacherModalVisible: false });
            }
          }}
        />
      </div>
    )
  }
}

