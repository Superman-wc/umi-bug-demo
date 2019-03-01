import React, {Component} from 'react';
import {connect} from 'dva';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorPage from './EditorPage';


class EditorFile extends Component {
  componentDidMount() {
    this.props.dispatch({type: namespace + '/buildQrCode', payload: {str: '12345'}});
  }

  render() {
    const {file, ...pageProps} = this.props;
    pageProps.file = file;
    const {print: {w}} = file || {};
    const style = {
      minWidth: w + 100,
      padding: 50
    };
    return (
      <div className={styles['editor-file']} style={style}>
        {
          file.pages && file.pages.length ?
            file.pages.map(page =>
              <EditorPage key={page.key} page={page} {...pageProps}/>
            )
            :
            null
        }
      </div>
    )
  }
}

export default connect(state => ({
  file: state[namespace].file,
  activePageKey: state[namespace].activePageKey,
  activeColumnKey: state[namespace].activeColumnKey,
  activeElementKey: state[namespace].activeElementKey,
}))(EditorFile);
