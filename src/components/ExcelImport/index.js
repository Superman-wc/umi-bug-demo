import React, {Component} from 'react';
import {connect} from 'dva';
import {message, Modal, Button, Progress} from 'antd';
import {QiniuUpToken, QiniuDomain} from '../../services';
import Uploader from '../Uploader';
import Flex from '../Flex';
import {Authenticate} from "../../utils/namespace";

@connect(state => ({
  authenticate: state[Authenticate].authenticate,
}))
export default class ExcelImportModal extends Component {
  render() {
    const {
      visible, onCancel, authenticate, excelImport,
      templateUrl, title,
    } = this.props;
    const modalProps = {
      visible,
      title,
      onCancel,
      destroyOnClose: true,
      footer: templateUrl ? (
        <div>
          <a href={templateUrl} target="_blank" rel="noopener noreferrer">模板文件下载</a>
        </div>
      ) : null
    };

    return (
      <Modal {...modalProps}>
        <Uploader
          direction="column"
          checkFileType={(mimeType) => {
            return mimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }}
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
            console.log('这里直接提交', res);

            return excelImport({excelUrl: res.url});

            // res.exercise.fileUrl = res.url;
            //
            // const payload = {
            //   fileName: res.exercise.fileName,
            //   fileUrl: res.url,
            // };
            //
            //
            // return new Promise((resolve, reject) => {
            //   this.props.dispatch({
            //     type: namespace + '/create',
            //     payload,
            //     resolve: exercise => {
            //       res.exercise = {...res.exercise, ...exercise};
            //       resolve(res);
            //     },
            //     reject
            //   });
            // })

          }}
          complete={(ex, arr) => {
            if (ex) {
              message.error('上传失败：' + (ex.message || ex));
            } else {
              message.success('创建资料成功,共' + arr.length + '个');
            }
            console.log('complete', ex, arr);
          }}
        />
      </Modal>
    )
  }
}
