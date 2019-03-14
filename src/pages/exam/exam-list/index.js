import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Cascader, Row, Col, message, Modal, Select, Input, notification, Spin } from 'antd';
import moment from 'moment';
import {
  ExamList as namespace,
  ExamDetail,
  ManagesGrade
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import router from 'umi/router';
import { GradeIndexEnum, ExamTypeEnum, ExamStatusEnum, Enums, getNameByValue } from "../../../utils/Enum";

@connect(state => ({
  total: state[namespace].total,
  listExam: state[namespace].listExam,
  gradeList: state[ManagesGrade].list,
  loading: state[namespace].loading,
}))
export default class ExamList extends Component {

  state = {};

  componentDidMount() {
    if (!this.props.gradeList) {
      this.props.dispatch({
        type: ManagesGrade + '/list',
        payload: { s: 1000 }
      })
    }
  }

  // 预览
  onPreview(row) {
    router.push({ pathname: ExamDetail, query: { id: row.id, name: row.name, releaseStatus: row.releaseStatus } });
  }

  // 上下线
  onPublishOffline(row) {
    dispatch({
      type: namespace + '/examPublishOffline',
      payload: {
        id: row.id
      },
      resolve: () => {
        const { query } = this.props.location;
        dispatch({
          type: namespace + '/listExam',
          payload: { ...query },
        })
        if (row.releaseStatus == 0) {
          notification.success({ message: '发布成功' });
        } else {
          notification.success({ message: '下线成功' });
        }
      }
    })
  }

  render() {
    const { listExam, gradeList = [], total, loading, location, dispatch } = this.props;
    let list = [];
    if (listExam) {
      list = listExam.list;
    }
    console.log(gradeList)
    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});
    const { query } = location;

    const title = '考务列表';

    const breadcrumb = ['考务管理', '考务列表'];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          console.log('exam-list: create')
        },
      },
    ];
    const gradeIndexs = Enums(GradeIndexEnum)
    const examTypes = Enums(ExamTypeEnum)

    const columns = [
      { title: 'ID', key: 'id', width: 40 },
      {
        title: '考试名称', key: 'examName', width: 120,
        render: (text, record, index) => record.name
      },
      {
        title: '考试时间', key: 'examTime', width: 120,
        render: (text, record, index) => {
          const startDay = record.startDay ? moment(record.startDay).format('YYYY-MM-DD') : '-';
          const endDay = record.endDay ? moment(record.endDay).format('YYYY-MM-DD') : '-';
          return startDay + '~' + endDay
        }
      },
      {
        title: '考试年级', key: 'gradeId',
        render: (v, row) => getNameByValue(gradeIndexs, row.gradeIndex) + '（' + (gradeMap[row.gradeId] && gradeMap[row.gradeId].schoolYear || '') + '级）',
        filters: gradeList.map(it => ({ value: it.id, text: it.name + '（' + it.schoolYear + '级' + '）' })),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
      },
      {
        title: '类型', key: 'examType',
        render: (text, record, index) => {
          return getNameByValue(examTypes, record.examType);
        },
        filters: [
          { value: ExamTypeEnum['期末考'], text: '期末考' },
          { value: ExamTypeEnum['期中考'], text: '期中考' },
          { value: ExamTypeEnum['月考'], text: '月考' }
        ],
        filtered: !!query.examType,
        filterMultiple: false,
        filteredValue: query.examType ? [query.examType] : [],
      },
      { title: '考试科目', key: 'subjectCount', },
      { title: '考生人数', key: 'studentNum', },
      {
        title: '每场人数', key: 'oneRoomNum',
        render: (text, record, index) => {
          let roomStudent = '-';
          if (record.roomColumnTotal && record.roomRowTotal) {
            roomStudent = (record.roomColumnTotal * record.roomRowTotal).toString();
          }
          return roomStudent;
        }
      },
      { title: '监考老师数', key: 'teacherNum', },
      { title: '更新时间', key: 'lastUpdated', width: 120, },
      { title: '发布时间', key: 'releaseTime', width: 120, },
      {
        title: '操作', key: 'releaseStatus', width: 120,
        filters: [
          { value: ExamStatusEnum['未发布'], text: '未发布' },
          { value: ExamStatusEnum['已发布'], text: '已发布' },
        ],
        filtered: !!query.releaseStatus,
        filterMultiple: false,
        filteredValue: query.releaseStatus ? [query.releaseStatus] : [],
        render: (id, row) => {
          if (row.releaseStatus == 0) {
            return (
              <TableCellOperation
                operations={{
                  preview: () => this.onPreview(row),
                  publish: {
                    onConfirm: () => this.onPublishOffline(row)
                  },
                  remove: {
                    onConfirm: () => {
                      dispatch({
                        type: namespace + '/examRemove',
                        payload: {
                          id: row.id
                        },
                        resolve: () => {
                          notification.success({ message: '删除成功' })
                          dispatch({
                            type: namespace + '/listExam',
                            payload: { ...query },
                          })
                        }
                      })
                    },
                  },
                }}
              />
            )
          } else {
            return (
              <TableCellOperation
                operations={{
                  preview: () => this.onPreview(row),
                  offline: {
                    onConfirm: () => this.onPublishOffline(row),
                  },
                }}
              />
            )
          }
        },
      },
    ];

    return (
      <ListPage
        operations={buttons}
        location={location}
        loading={!!loading}
        columns={columns}
        breadcrumb={breadcrumb}
        list={list}
        total={total}
        pagination
        title={title}
      >
      </ListPage>
    );
  }
}
