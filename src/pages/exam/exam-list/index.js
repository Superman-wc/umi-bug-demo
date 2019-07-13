import React, {Component} from 'react';
import {connect} from 'dva';
import {notification} from 'antd';
import moment from 'moment';
import {
  ExamList as namespace,
  ExamDetail,
  ExamCreate,
  ManagesGrade
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import router from 'umi/router';
import {ExamTypeEnum, ExamStatusEnum, Enums} from "../../../utils/Enum";

@connect(state => ({
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
        payload: {s: 1000}
      })
    }
  }

  // 预览
  onPreview = ({id, name, releaseStatus}) => {
    router.push({pathname: ExamDetail, query: {id, name, releaseStatus}});
  };

  // 上下线
  onPublishOffline = ({id, releaseStatus}) => {
    const {dispatch} = this.props;
    dispatch({
      type: namespace + '/examPublishOffline',
      payload: {
        id
      },
      resolve: () => {
        const {query} = this.props.location;
        dispatch({
          type: namespace + '/listExam',
          payload: {...query},
        });
        notification.success({message: releaseStatus === 0 ? '发布成功' : '下线成功'});
      }
    })
  }

  render() {
    const {listExam, gradeList = [], loading, location, dispatch} = this.props;
    let list = [];
    let total = 0;
    if (listExam) {
      list = listExam.list;
      total = listExam.total;
    }
    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});
    const {query} = location;

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
          router.push({pathname: ExamCreate});
        },
      },
    ];

    const columns = [
      {
        title: 'ID', key: 'id', width: 40,
        render: (text, record, index) => index + 1
      },
      {
        title: '考试名称', key: 'name', width: 120,
      },
      {
        title: '考试时间', key: 'examTime', width: 120,
        render: (text, {startDay, endDay}) => (
          (startDay ? moment(startDay).format('MM-DD') : '-') +
          '~' +
          (endDay ? moment(endDay).format('MM-DD') : '-')
        )
      },
      {
        title: '考试年级', key: 'gradeId', width: 120,
        render: (v) => gradeMap[v] ? `${gradeMap[v].name}(${gradeMap[v].schoolYear}级)` : '-',
        filters: gradeList.map(it => ({value: it.id, text: `${it.name}(${it.schoolYear}级)`})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
      },
      {
        title: '类型', key: 'examType', width:80,
        render: (v) => ExamTypeEnum[v] || '-',
        filters: Enums(ExamTypeEnum).map(it=>({value: it.value, text:it.name})),
        filtered: !!query.examType,
        filterMultiple: false,
        filteredValue: query.examType ? [query.examType] : [],
      },
      {title: '考试科目', key: 'subjectCount',},
      {title: '考生人数', key: 'studentNum',},
      {
        title: '每场人数', key: 'roomColumnTotal',
        render: (v, {roomRowTotal}) => (v * roomRowTotal || '-')
      },
      {title: '监考教师', key: 'teacherNum', width: 80, render: v => v ? v + '人' : '-'},
      {title: '更新时间', key: 'lastUpdated', width: 120, format: 'MM-DD HH:mm'},
      {title: '发布时间', key: 'releaseTime', width: 120, format: 'MM-DD HH:mm'},
      {
        title: '状态', key: 'releaseStatus', width:80,
        render: (v, row) => v !== 0 ?'已发布':(['-', '创建中', '创建失败', '创建成功'][row.examState] || '-'),
        filters: [
          {value: ExamStatusEnum['未发布'], text: '未发布'},
          {value: ExamStatusEnum['已发布'], text: '已发布'},
        ],
        filtered: !!query.releaseStatus,
        filterMultiple: false,
        filteredValue: query.releaseStatus ? [query.releaseStatus] : [],
      },
      {
        title: '操作', key: 'op', width: 140,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              preview: {
                children: '预览',
                hidden: row.examState !== 3,
                onClick: () => this.onPreview(row),
              },
              publish: {
                hidden: !(row.examState === 3 && row.releaseStatus === 0),
                onConfirm: () => this.onPublishOffline(row)
              },
              offline: {
                hidden: !(row.examState === 3 && row.releaseStatus !== 0),
                onConfirm: () => this.onPublishOffline(row),
              },
              remove: {
                hidden: row.releaseStatus !== 0,
                onConfirm: () => {
                  dispatch({
                    type: namespace + '/examRemove',
                    payload: {
                      id: row.id
                    },
                    resolve: () => {
                      notification.success({message: '删除成功'});
                      dispatch({
                        type: namespace + '/listExam',
                        payload: {...query},
                      })
                    }
                  })
                },
              },
            }}
          />
        )
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
