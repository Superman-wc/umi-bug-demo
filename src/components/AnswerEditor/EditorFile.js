import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Alert} from 'antd';
import styles from './answer.less';
import {AnswerEditor as namespace, Authenticate} from "../../utils/namespace";
import EditorPage from './EditorPage';

const CheckContentOverflow = Symbol('EditorFile#checkContentOverflow');


class EditorFile extends Component {
  componentDidMount() {
    this.checkContentOverflow('componentDidMount');
  }

  componentDidUpdate(prevProps, prevState, snap) {
    this.checkContentOverflow('componentDidUpdate');
  }

  checkContentOverflow = (v) => {
    console.log('checkContentOverflow--->', v);
    clearTimeout(this[CheckContentOverflow]);
    this[CheckContentOverflow] = setTimeout(() => {
      this.props.dispatch({
        type: namespace + '/checkContentOverflow',
      });
    }, 50);
  };

  render() {
    const {file, ...pageProps} = this.props;
    pageProps.file = file;
    const {print: {w}} = file || {};
    const style = {
      minWidth: w + 100,
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
        <div className={styles['editor-file']} style={style}>
          {
            file.pages && file.pages.length ?
              file.pages.map((page, index) =>
                <EditorPage key={page.key} index={index} page={page} {...pageProps}/>
              )
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
