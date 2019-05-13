import React, {Component, Fragment} from 'react';
import EditorHeader from './EditorHeader';
import EditorRightPanel from './EditorRightPanel';
import EditorBody from './EditorBody';
import styles from './answer.less';

export default class Editor extends Component {

  componentDidMount() {
    document.body.id = styles['editor'];
    document.querySelector('#root').className = styles['editor-root'];

    window.onbeforeprint = (ex) => {
      ex.preventDefault();
      ex.stopPropagation();
      console.log('onbeforeprint===>', ex);
    }

  }

  componentWillUnmount() {
    document.body.id = '';
    document.querySelector('#root').className = '';
  }

  render() {
    const {location: {query, pathname}} = this.props;
    return (
      <Fragment>
        <EditorHeader query={query} pathname={pathname}/>
        <EditorBody query={query}/>
        <EditorRightPanel query={query}/>
      </Fragment>
    );
  }
}



