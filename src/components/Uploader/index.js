import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Flex from '../Flex';
import {pipes} from '../../utils/pipe';
import {Progress, Icon, Button} from 'antd';
import Qiniuyun from '../../utils/Qiniuyun';
import uuid from 'uuid/v5';
import styles from './index.less';

export default class Uploader extends Component {
  static propTypes = {
    qiNiuYunConfig: PropTypes.object,
    checkFileType: PropTypes.func,
    success: PropTypes.func,
    complete: PropTypes.func,
    direction: PropTypes.string,
  };

  state = {
    drag: false,
    list: [],
  };

  handleUpload = e => {
    const {
      qiNiuYunConfig,
      checkFileType = (...args) => !/image/i.test(...args),
      onAddFile = (file) => file,
      success,
      complete,
    } = this.props;

    const files = (e.dataTransfer && e.dataTransfer.files) || e.target.files;
    if (files && files.length) {
      const qiniuyun = new Qiniuyun(qiNiuYunConfig);
      const all = [];
      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        //验证图片文件类型
        if (file.type && checkFileType(file.type)) {
          continue;
        }
        const names = file.name.split('.');
        let extName = names[names.length - 1] || file.type.split('/')[1] || 'jpg';
        let date = new Date();
        const f = a => a >= 10 ? a : ('0' + a);
        const y = date.getFullYear();
        const m = f(date.getMonth() + 1);
        const d = f(date.getDate());
        const filename = `${y}/${m}/${d}/`+
          uuid(file.name + Date.now() + (Math.random() + '0000').substr(0, 6), uuid.URL) +
          '.' +
          extName;
        all.push(onAddFile({file, filename}));
      }

      this.setState({list: all});

      pipes(
        (it, index) =>
          qiniuyun.upload({...it, index}, {
            onStart: this.onStart,
            onProgress: this.onProgress,
            onEnd: this.onEnd,
            onError: this.onError
          }),
        success
      )(...all)
        .then((...args) => complete(null, ...args))
        .catch(complete);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  reUpload = () => {
    const {qiNiuYunConfig, success, complete} = this.props;
    const all = this.state.list.filter(it => !it.res);
    const qiniuyun = new Qiniuyun(qiNiuYunConfig);
    pipes(
      (it, index) =>
        qiniuyun.upload(
          {...it, index},
          {
            onStart: this.onStart,
            onProgress: this.onProgress,
            onEnd: this.onEnd,
            onError: this.onError
          }
        ),
      success
    )(...all)
      .then((...args) => complete(null, ...args))
      .catch(complete);
  };

  onStart = ({index}) => {
    const {list} = this.state;
    list[index].status = 'active';
    this.setState({list: [...list]});
  };
  onProgress = (progress, {index}) => {
    const {list} = this.state;
    list[index].progress = progress;
    this.setState({list: [...list]});
  };
  onEnd = (res, {index}) => {
    const {list} = this.state;
    list[index].status = 'success';
    list[index].res = res;
    this.setState({list: [...list]});
  };
  onError = (ex, {index}) => {
    const {list} = this.state;
    list[index].status = 'exception';
    list[index].error = ex;
    this.setState({list: [...list]});
  };

  render() {
    const {dropEnabled = true, multiple = true} = this.props;
    const {list, drag} = this.state;

    const children = this.props.children || (
      <span>
        <Icon type="upload"/>请选择或拖放文件到此处
      </span>
    );

    const {
      renderItem = (it) =>
        <div key={it.filename} className={styles['list-item']}>
          <Flex>
            <div style={{width: 280, overflow: 'hidden'}}>{it.filename}</div>
            <Flex.Item>
              <Progress percent={it.progress || 0} status={it.status}/>
            </Flex.Item>
          </Flex>
          {
            it.error ? (
                <div>
                  <Button onClick={this.reUpload()}>重新上传</Button>
                  it.error.message
                </div>
              )
              :
              null
          }
        </div>
    } = this.props;

    const fileInputProps = {
      type: 'file',
      onChange: this.handleUpload,
    };
    if (dropEnabled) {
      fileInputProps.onDragEnter = () => this.setState({drag: true});
      fileInputProps.onDragLeave = () => this.setState({drag: false});
      fileInputProps.onDrop = this.handleUpload;
    }
    if (multiple) {
      fileInputProps.multiple = 'multiple';
    }

    const props = {
      className: classNames(styles['uploader'], {[styles['drag']]: drag}),
      direction: this.props.direction
    };

    return (
      <Flex {...props}>
        <div className="ant-btn">
          {children}
          <input {...fileInputProps}/>
        </div>
        <Flex.Item overflow="auto">
          {
            list && list.length
              ?
              list.map(renderItem)
              :
              null
          }
        </Flex.Item>
      </Flex>
    );
  }
}
