import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import { Switch} from 'antd';
import {
  AnswerEditor as namespace, ExaminerPrint,
  ManagesGrade, ManagesSubject,
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {AnswerCardTypeEnum} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
  loadingPrint: state[ExaminerPrint].loading,
}))
export default class ExaminerAnswerListPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;

    dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 10000}
    });
    dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000}
    });

  }


  render() {
    const {
      list, total, loading, location, dispatch,
      gradeList = [], subjectList = [],
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

    const title = '在线批卷';

    const breadcrumb = ['电子阅卷', title];

    const buttons = [
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '考试名称', key: 'title', width: 'auto'},
      {title: '科目', key: 'subjectId', render: v => subjectMap && subjectMap[v] && subjectMap[v].name || v},
      {title: '年级', key: 'gradeId', render: v => gradeMap && gradeMap[v] && gradeMap[v].name || v},
      {title: '类型', key: 'type', render: v => AnswerCardTypeEnum[v] || v},
      {title: '试卷数', key: 'hasUploadCount',},
      {title: '批改进度', key: 'progress', width: 100,},
      {
        title: '自动阅卷',
        key: 'automatic',
        width: 100,
        render: (v, item) => <Switch checked={v === 1} onChange={(value) => {
          console.log(v);
          dispatch({
            type: namespace + '/modify',
            payload: {
              id: item.id,
              automatic: value ? 1 : 0
            }
          })
        }}/>
      },
      {title: '创建时间', key: 'dateCreated', width: 150,},
      {
        title: '操作', width: 200,
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              add: {
                children: '添加试卷',
                onClick: () => {
                  router.push({pathname: '/examiner/workspace'})
                }
              },
              marking: {
                children: '手动阅卷',
                onClick: () => {
                  router.push({pathname: pathname + '/' + id})
                }
              },
              download: {
                children: '下载成绩',
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
      <ListPage {...listPageProps}>

      </ListPage>
    );
  }
}
