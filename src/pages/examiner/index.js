import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import {Form, Modal, notification, Cascader} from 'antd';
import {
  AnswerEditor as namespace,
  ManagesGrade, ManagesSubject, ManagesClass,
} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import TableCellOperation from '../../components/TableCellOperation';
import {BuildingTypeEnum, ClassTypeEnum, Enums, AnswerCardTypeEnum} from "../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
  klassList: state[ManagesClass].list,
}))
export default class ExaminerAnswerListPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;
    dispatch({
      type: namespace + '/list',
      payload: {...query}
    });
    dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 10000}
    });
    dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000}
    });
    dispatch({
      type: ManagesClass + '/list',
      payload: {s: 10000}
    });
  }


  render() {
    const {
      list, total, loading, location, dispatch,
      gradeList = [], subjectList = [], klassList = []
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

    const title = '答题卡列表';

    const breadcrumb = ['管理', '答题卡管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          router.push({pathname: namespace + '/editor'});
        },
      },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '版本', key: 'ver', width: 40,},
      {title: '年级', key: 'gradeId', render: v => gradeMap && gradeMap[v] && gradeMap[v].name || v},
      {title: '科目', key: 'subjectId', render: v => subjectMap && subjectMap[v] && subjectMap[v].name || v},
      {title: '类型', key: 'type', render: v => AnswerCardTypeEnum[v] || v},
      {title: '创建时间', key: 'dateCreated',},
      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => {
                dispatch({
                  type: namespace + '/item',
                  payload: {id},
                  resolve: (res) => {
                    console.log(res);
                    dispatch({
                      type: namespace + '/set',
                      payload: {file: res}
                    });
                    router.push({pathname: namespace + '/editor', query: {id}});
                  }
                })
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
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
      />
    );
  }
}
