import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import {Form, Modal, InputNumber, Radio} from 'antd';
import {
  AnswerEditor as namespace, ExaminerPrint, ExaminerRecord,
  ManagesGrade, ManagesSubject,
} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import TableCellOperation from '../../components/TableCellOperation';
import {AnswerCardTypeEnum} from "../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
  // klassList: state[ManagesClass].list,
  loadingPrint: state[ExaminerPrint].loading,
}))
export default class ExaminerAnswerListPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location: {pathname, query}, subjectList = []} = this.props;
    // dispatch({
    //   type: namespace + '/list',
    //   payload: {...query}
    // });
    dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 10000}
    });
    dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000},
      resolve: (res) => {
        if (!query.subjectId && res && res.list && res.list.length) {
          const subject = res.list.find(it => it.name === '英语');
          if (subject) {
            router.replace({pathname, query: {...query, subjectId: subject.id}});
          }
        }
      }
    });
    if (!query.subjectId && subjectList && subjectList.length) {
      const subject = subjectList.find(it => it.name === '英语');
      if (subject) {
        router.replace({pathname, query: {...query, subjectId: subject.id}});
      }
    }

    // dispatch({
    //   type: ManagesClass + '/list',
    //   payload: {s: 10000, simple: 1}
    // });
  }


  render() {
    const {
      list, total, loading, location, dispatch,
      gradeList = [], subjectList = [], loadingPrint
    } = this.props;

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const subjectMap = subjectList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});


    const {pathname, query} = location;

    const title = '英语答题卡列表';

    const breadcrumb = ['管理', '答题卡管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          dispatch({
            type: namespace + '/newFile',
          });
          router.push({pathname: namespace + '/editor'});
        },
      },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '文件', key: 'title', width: 250},
      {title: '版本', key: 'ver', width: 40,},
      {title: '年级', key: 'gradeId', render: v => gradeMap && gradeMap[v] && gradeMap[v].name || v},
      {title: '科目', key: 'subjectId', render: v => subjectMap && subjectMap[v] && subjectMap[v].name || v},
      {title: '类型', key: 'type', render: v => AnswerCardTypeEnum[v] || v},
      {title: '创建时间', key: 'dateCreated', width: 120,},
      {
        title: '操作', width: 140,
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              record: {
                children: '题目',
                onClick: () => {
                  router.push({
                    pathname: ExaminerRecord,
                    query: {editorId: id, editorTitle: row.title}
                  })
                }
              },
              upload: {
                children: '上传记录',
                onClick: () => {
                  router.push({pathname: namespace + '/upload', query: {editorId: id, title: row.title}})
                }
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const listPageProps = {
      location, columns, breadcrumb, list, total, title,
      operations: buttons,
      loading: !!loading,
      pagination: true,
    };


    return (
      <ListPage {...listPageProps}/>
    );
  }
}
