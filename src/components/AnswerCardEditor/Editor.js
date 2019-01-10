import React, {Component} from 'react';
import {Button} from 'antd';
import styles from './Editor.less';
import Core from './Core';
import classNames from 'classnames';

export default class Editor extends Component {

  state = {};

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

function Panel({header, children, footer, className, style}) {
  return (
    <section className={classNames(styles['editor-panel'], className)} style={style}>
      {
        header ?
          <header>{header}</header>
          :
          null
      }
      {
        children ?
          <main>{children}</main>
          :
          null
      }
      {
        footer ?
          <footer>{footer}</footer>
          :
          null
      }
    </section>
  )
}


class AttributePanel extends Component {
  render() {
    const {element} = this.props;
    const attributeNames = element.getAttributeNames().map(name => ({name, value: element.getAttribute(name)}));

    return (
      <Panel className={styles['editor-attribute-panel']}>
        {
          attributeNames.map(it =>
            <div key={it.name}>{it.name}:{it.value}</div>
          )
        }
      </Panel>
    )
  }
}
