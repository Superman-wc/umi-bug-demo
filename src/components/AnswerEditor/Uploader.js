import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {pipes} from '../../utils/pipe';
import {Spin} from 'antd';
import Qiniuyun from '../../utils/Qiniuyun';
import uuid from 'uuid/v5';
import styles from './answer.less';


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
      success = (args) => args,
      complete = (args) => args,
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
        const filename = `${y}/${m}/${d}/` +
          uuid(file.name + Date.now() + (Math.random() + '0000').substr(0, 6), uuid.URL) +
          '.' +
          extName;
        all.push(onAddFile({file, filename}));
      }

      this.setState({list: all, loading: true});

      pipes(
        (it, index) => qiniuyun.upload({...it, index}, {
          onStart: this.onStart,
          onProgress: this.onProgress,
          onEnd: this.onEnd,
          onError: this.onError
        }),
        success
      )(...all)
        .then((...args) => complete(null, ...args))
        .catch(complete)
        .finally(() => {
          this.setState({loading: false});
        });
    }
    e.preventDefault();
    e.stopPropagation();
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
    const {dropEnabled = true, multiple = true, children} = this.props;
    const {list, drag, loading} = this.state;


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


    return (
      <Spin spinning={!!loading}>
        <div className={classNames(styles['uploader'], {[styles['drag']]: drag})}>
          {children}
          <input {...fileInputProps}/>
        </div>
      </Spin>
    );
  }
}


export function upload(e, {
  qiNiuYunConfig,
  checkFileType = (...args) => !/image/i.test(...args),
  onAddFile = (file) => file,
  success = (args) => args,
  complete = (args) => args,
  onStart,
  onProgress,
  onEnd,
  onError,
  onChange
} = {}) {

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
      const filename = `${y}/${m}/${d}/` +
        uuid(file.name + Date.now() + (Math.random() + '0000').substr(0, 6), uuid.URL) +
        '.' +
        extName;
      all.push(onAddFile({file, filename}));
    }

    onChange && onChange({list: all, loading: true});

    pipes(
      (it, index) => qiniuyun.upload({...it, index}, {
        onStart,
        onProgress,
        onEnd,
        onError,
      }),
      success
    )(...all)
      .then((...args) => complete(null, ...args))
      .catch(complete)
      .finally(() => {
        onChange && onChange({loading: false});
      });
  }
}
