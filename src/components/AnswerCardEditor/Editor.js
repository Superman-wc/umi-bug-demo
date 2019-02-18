import React, {Component} from 'react';
import {Button, Form, Input, message} from 'antd';
import styles from './Editor.less';
import Core from './Core';
import classNames from 'classnames';
import AttributePanel from './Attribute/Panel';



export default class Editor extends Component {

  state = {

  };

  render() {
    return (
      <section className={styles['editor']}>
        <header className={styles['editor-header']}>
          <Button.Group>
            <Button>8K</Button>
            <Button>16K</Button>
          </Button.Group>


          <Button.Group>
            <Button>判断题</Button>
            <Button>选择题</Button>
            <Button>填空题</Button>
            <Button>解答题</Button>
          </Button.Group>

        </header>
        <main className={styles['editor-main']}>
          <div className={styles['editor-left']}>

          </div>
          <div className={styles['editor-body']}>
            <Core onSelectElement={(element, opt) => {
              this.setState({element});
            }}/>
          </div>
          <div className={styles['editor-right']}>
            {
              this.state.element ?
                <AttributePanel element={this.state.element}/>
                :
                null
            }
          </div>
        </main>
        <footer className={styles['editor-footer']}>

        </footer>
      </section>
    )
  }
}





