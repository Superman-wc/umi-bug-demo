import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import {Form, Modal, InputNumber, Radio} from 'antd';
import {
  ExaminerRecord as namespace, Examiner,
  ManagesGrade, ManagesSubject,
} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import TableCellOperation from '../../components/TableCellOperation';
import {AnswerCardTypeEnum} from "../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
export default class ExaminerAnswerListPage extends Component {

  state = {};


  render() {
    const {
      list, total, loading, location, dispatch,
    } = this.props;


    const {pathname, query} = location;

    const title = '题目列表' + (query.editorTitle ? ' - ' + query.editorTitle : '');

    const breadcrumb = ['管理', '答题卡管理', title];

    const buttons = [
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '类型', key: 'answerType', width: 80},
      {title: '班级', key: 'unitId',},
      {title: '学号', key: 'studentCode', width: 80,},
      {title: '题号', key: 'num', width: 40,},
      {title: '图片', key: 'url', width: 40, render: v => v ? <a href={v} target="_blank">查看</a> : '-'},
      {title: '创建时间', key: 'dateCreated', width: 120,},
      {
        title: '操作', width: 140,
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              get: {
                children: '详情',
                onClick: () => {
                  router.push({
                    pathname: Examiner + '/english-composition-analyze',
                    query: {
                      recordId: id
                    }
                  })
                }
              }
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
