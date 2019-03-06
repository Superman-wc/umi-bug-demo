import React, {Component, Fragment} from 'react';
import EditorHeader from './EditorHeader';
import EditorRightPanel from './EditorRightPanel';
import EditorBody from './EditorBody';
import styles from './answer.less';

export default class Editor extends Component {

  componentDidMount() {
    document.body.id = styles['editor'];
    document.querySelector('#root').className = styles['editor-root'];

  }

  componentWillUnmount() {
    document.body.id = '';
    document.querySelector('#root').className = '';
  }

  render() {
    return (
      <Fragment>
        <EditorHeader/>
        <EditorBody/>
        <EditorRightPanel/>
      </Fragment>
    );
  }
}



