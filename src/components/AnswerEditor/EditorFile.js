import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Alert} from 'antd';
import styles from './answer.less';
import {AnswerEditor as namespace, Authenticate} from "../../utils/namespace";
import EditorPage from './EditorPage';

const CheckContentOverflow = Symbol('EditorFile#checkContentOverflow');


class EditorFile extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: namespace + '/buildElementOffset',
    });
    this.checkContentOverflow('componentDidMount');
  }

  componentDidUpdate(prevProps, prevState, snap) {
    this.checkContentOverflow('componentDidUpdate');
    // this.props.file && this.props.file.data && window.debugShowData(this.props.file.data)
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({
      type: namespace + '/set',
      payload: {file: null, activePageKey: null, activeColumnKey: null, activeElementKey: null}
    })
  }

  checkContentOverflow = (v) => {
    console.log('checkContentOverflow--->', v);
    clearTimeout(this[CheckContentOverflow]);
    const {dispatch} = this.props;
    this[CheckContentOverflow] = setTimeout(() => {
      dispatch({
        type: namespace + '/checkContentOverflow',
      });
    });
  };

  render() {
    const {file, ...pageProps} = this.props;
    pageProps.file = file;
    const {print: {w}} = file || {};
    const style = {
      width: w + 100,
      padding: 50
    };
    return (
      <Fragment>
        {
          file.pages && file.pages.length > 2 ?
            <div className={styles['editor-message-bar']}>
              <Alert showIcon type="warning" banner message="警告" description="最多支持一张两页答题纸"/>
            </div>
            :
            null
        }
        <div id={file.key} className={styles['editor-file']} role="file" style={style}>
          {
            file.pages && file.pages.length ?
              file.pages.map((page, index) =>
                <EditorPage key={page.key} index={index} page={page} {...pageProps}/>
              )
              :
              null
          }
          {
            !file.id ?
              <div data-save="打印校验"/>
              :
              null
          }
        </div>
      </Fragment>
    )
  }
}


export default connect(state => ({
  file: state[namespace].file,
  activePageKey: state[namespace].activePageKey,
  activeColumnKey: state[namespace].activeColumnKey,
  activeElementKey: state[namespace].activeElementKey,
  profile: state[Authenticate].authenticate
}))(EditorFile);
