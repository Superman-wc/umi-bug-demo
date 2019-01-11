import React, {Component} from 'react';
import {Button, Form, Input} from 'antd';
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
    const attributeMap = {};
    const attributes = element.getAttributeNames().map(name => {
      const it =  {name, value: element.getAttribute(name)};
      attributeMap[name] = it;
      return it;
    });


    if(element.tagName==='text'){
      attributeMap.innerHTML={name:'innerHTML',value:element.innerHTML};
      attributes.push(attributeMap.innerHTML);
    }

    console.log(attributes);

    const wrap = {
      labelCol:{span:6},
      wrapperCol:{span:16},
    };

    return (
      <Panel className={styles['editor-attribute-panel']}>
        <Form layout="horizontal">
          {
            attributes.map(it =>
              <Form.Item key={it.name} label={it.name} {...wrap}>
                <Input value={it.value} onChange={(e)=>{
                  if(it.name==='innerHTML'){
                    element.innerHTML = e.target.value;
                  }else {
                    element.setAttribute(it.name, e.target.value);
                  }
                  this.forceUpdate();
                }} />
              </Form.Item>
            )
          }
        </Form>
      </Panel>
    )
  }
}
