import React, {Component} from 'react';
import {connect} from 'dva';
import {message, Progress, Button} from 'antd';
import Uploader from '../../components/Uploader';
import {Authenticate} from "../../utils/namespace";
import {QiniuDomain, QiniuUpToken} from "../../services";
import Page from '../../components/Page';
import PageHeaderOperation from '../../components/Page/HeaderOperation';
import Flex from '../../components/Flex';
import {ExaminerSheet as namespace} from '../../utils/namespace';
import ListPage from '../../components/ListPage'
import {AnswerCardTypeEnum} from "../../utils/Enum";
import TableCellOperation from '../../components/TableCellOperation';
import {ExaminerStatusEnum} from '../../utils/Enum';
import {analyze} from "../../services/examiner/sheet";


@connect(state => ({
  authenticate: state[Authenticate].authenticate,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
export default class UploadPage extends Component {

  componentWillMount() {
    const {dispatch, location: {query}} = this.props;
    dispatch({
      type: namespace + '/list',
      payload: {
        ...query
      }
    });
  }

  render() {
    const {
      list, total, loading, location, dispatch, authenticate,
    } = this.props;

    const title = '答题卡上传';

    const breadcrumb = ['管理', '电子阅卷', title];

    const buttons = [];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '答题卡', key: 'editorTitle', width: 250,},

      {title: '文件', key: 'url', width: 60, render: v => <img src={v + '!t'} height={40} onClick={()=>{
        window.open(v+'!page');
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
              analyze: {
                children: '阅卷',
                onClick: () => {
                  dispatch({
                    type: namespace + '/analyze',
                    payload: {id},
                    resolve: res => {
                      message.success(`阅卷结果：${ExaminerStatusEnum[res.status]}`);
                    }
                  })

                }
              },
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
      headerChildren: (
        <div style={{position: 'relative', height: 80}}>
          <div style={{position: 'absolute', width: '100%', height: '100%'}}>
            <Uploader
              direction="column"
              qiNiuYunConfig={{
                getTokenUrl: QiniuUpToken + '?bucket=bugu',
                getTokenHeaders: {authorization: authenticate.token},
                domain: QiniuDomain,
              }}
              renderItem={
                (it) => {
                  return (
                    <div key={it.filename}>
                      <Flex>
                        <div style={{width: 350, overflow: 'hidden'}}>{it.file.name}</div>
                        <Flex.Item>
                          {
                            it.error ? (
                                <div>
                                  <Button onClick={this.reUpload()}>重新上传</Button>
                                  it.error.message
                                </div>
                              )
                              :
                              <Progress percent={it.progress || 0} status={it.status}/>
                          }
                        </Flex.Item>
                      </Flex>

                    </div>
                  );
                }
              }
              onAddFile={(res) => {
                return res;
              }}
              success={res => {
                const {url} = res;
                return new Promise((resolve, reject) => {
                  dispatch({
                    type: namespace + '/create',
                    payload: {
                      url
                    },
                    resolve: (res) => {
                      dispatch({
                        type: namespace + '/analyze',
                        payload: {id: res.id},
                        reject: (ex) => {
                          reject(new Error('阅卷失败：' + ex.message));
                        },
                        resolve: res => {
                          if (res.status === ExaminerStatusEnum.完成) {
                            resolve(res);
                          } else {
                            reject(new Error(`阅卷结果：${ExaminerStatusEnum[res.status]}`));
                          }
                        }
                      })
                    },
                    reject: (ex) => {
                      reject(new Error('创建记录失败：' + ex.message));
                    },
                  });
                })
              }}
              complete={(ex, arr) => {
                if (ex) {
                  message.error('失败：' + (ex.message || ex));
                } else {
                  message.success('创建资料成功,共' + arr.length + '个');
                }
                console.log('complete', ex, arr);
              }}
            />
          </div>
        </div>
      )
    };

    return (
      <ListPage {...listPageProps} />
    )
  }
}
