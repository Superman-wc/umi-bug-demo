import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import {
  ExaminerPrint as namespace, AnswerEditor,
} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import TableCellOperation from '../../components/TableCellOperation';
import {PrintStatusEnum} from "../../utils/Enum";


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

    const title = '打印列表';

    const breadcrumb = ['管理', '打印管理', title];

    const buttons = [
      {
        key: 'refresh',
        type: 'primary',
        children: '刷新',
        title: '刷新',
        icon: 'refresh',
        onClick: () => {
          dispatch({
            type: namespace + '/list',
            payload: {
              ...query
            }
          })
        },
      },
      {
        key: 'rollback'
      }
    ];


    const columns = [
      {title: 'ID', key: 'id'},
      {title: '文件名', key: 'examinerEditorName', width: 'auto', tac: false},
      {title: '打印份数', key: 'num', width: 80},
      {title: '打印要求', key: 'requirement', width: 100,},
      {title: '申请教师', key: 'applicantName', width: 80},
      {
        title: '状态', key: 'status', width: 100,
        render: (v) => PrintStatusEnum[v] || v
      },
      {title: '创建时间', key: 'dateCreated', width: 100, format: 'MM-DD HH:mm'},
      {
        title: '操作', width: 160,
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              print: {
                children: '打印',
                hidden: !row.examinerEditorId || row.status !== PrintStatusEnum.待处理,
                onClick: () => {
                  router.push({pathname: AnswerEditor + '/editor', query: {id: row.examinerEditorId, readOnly: true}});
                }
              },
              notice: {
                children: <span style={{color: '#f80'}}>通知取件</span>,
                hidden: !row.examinerEditorId || row.status !== PrintStatusEnum.待处理,
                onClick: () => {
                  dispatch({
                    type: namespace + '/modify',
                    payload: {
                      id,
                      status: PrintStatusEnum.待取件
                    }
                  });
                }
              },
              end: {
                children: <span style={{color: '#08f'}}>已取件</span>,
                hidden: !row.examinerEditorId || row.status !== PrintStatusEnum.待取件,
                onClick: () => {
                  dispatch({
                    type: namespace + '/modify',
                    payload: {
                      id,
                      status: PrintStatusEnum.已取件
                    }
                  });
                }
              }
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
        list={(list||[]).sort((a, b) => a.status - b.status || b.id - a.id)}
        total={total}
        pagination
        title={title}
      />
    );
  }
}
