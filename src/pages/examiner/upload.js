import React, {Component} from 'react';
import {connect} from 'dva';
import {message, Progress, Button} from 'antd';
import Uploader from '../../components/Uploader';
import {Authenticate} from "../../utils/namespace";
import {QiniuDomain, QiniuUpToken} from "../../services";
import Flex from '../../components/Flex';
import {ExaminerSheet as namespace} from '../../utils/namespace';
import ListPage from '../../components/ListPage'
import TableCellOperation from '../../components/TableCellOperation';
import {ExaminerStatusEnum} from '../../utils/Enum';


@connect(state => ({
  list: state[namespace].list,
  total: state[namespace].total,
  loading: state[namespace].loading,
}))
export default class UploadPage extends Component {

  // componentWillMount() {
  //   const {dispatch, location: {query}} = this.props;
  //   dispatch({
  //     type: namespace + '/list',
  //     payload: {
  //       ...query
  //     }
  //   });
  // }

  render() {
    const {
      list, total, loading, location, dispatch,
    } = this.props;

    const title = '答题卡上传';

    const breadcrumb = ['管理', '电子阅卷', title];

    const buttons = [{
      key:'rollback'
    }];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '答题卡', key: 'editorTitle', width: 250,},

      {title: '文件', key: 'rotatedUrl', width: 60, render: (v, it) => <img src={(v || it.url) + '!t'} height={40} onClick={()=>{
        window.open((v || it.url)+'!page');
        }}/>},
      {title: '上传者', key: 'createdBy',},
      {
        title: '状态',
        key: 'status',
        render: (v, it) => [ExaminerStatusEnum[v], it.lastErrorMsg].filter(it => !!it).join('：')
      },
      {title: '创建时间', key: 'dateCreated',},
      {
        title: '操作', width:120,
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              // analyze: {
              //   children: '阅卷',
              //   onClick: () => {
              //     dispatch({
              //       type: namespace + '/analyze',
              //       payload: {id},
              //       resolve: res => {
              //         message.success(`阅卷结果：${ExaminerStatusEnum[res.status]}`);
              //       }
              //     })
              //
              //   }
              // },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
              look: {
                hidden: !row.debugUrl,
                children:'查看',
                onClick:()=>{
                  window.open(row.debugUrl+'!page');
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
      <ListPage {...listPageProps} />
    )
  }
}
