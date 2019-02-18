import React, {Component} from 'react';
import {Form, message} from 'antd';
import styles from './panel.less';
import AttributeEditor from './Editor';
import Panel from '../Panel';
import AttributeType from './type';
import {isRoot, createPageTitle, getPageTitle, getPageTitleElement} from "../common";

export default class AttributePanel extends Component {

  render() {
    const {element} = this.props;
    const attributeMap = {};
    const attributes = [];

    const isSVG = isRoot(element);

    if (isSVG) {
      const pageTitleAttribute = {
        name: 'page-title',
        label: '标题',
        value: getPageTitle(element)
      };
      attributeMap['page-title'] = pageTitleAttribute;
      attributes.push(pageTitleAttribute);

    } else {

      element.getAttributeNames().forEach(name => {
        const it = {name, value: element.getAttribute(name)};
        attributeMap[name] = it;
        attributes.push(it);
      });

    }

    if (element.tagName === 'text') {
      attributeMap.innerHTML = {name: 'innerHTML', value: element.innerHTML};
      attributes.push(attributeMap.innerHTML);
    }

    console.log(element.tagName, attributes);

    const wrap = {
      labelCol: {span: 6},
      wrapperCol: {span: 16},
    };

    return (
      <Panel className={styles['editor-attribute-panel']}>
        <Form layout="horizontal">
          {
            attributes.map(it =>
              <AttributeEditor
                key={it.name}
                attribute={{...it, ...AttributeType[it.name]}}
                wrap={wrap}
                onChange={({name, value}) => {
                  try {
                    if (isSVG) {
                      if (name === 'page-title') {
                        let pageTitleElement = getPageTitleElement(element);
                        if (!pageTitleElement) {
                          pageTitleElement = createPageTitle(element);
                        }
                        pageTitleElement.innerHTML = value;
                      } else {
                        element.dataset[name.replace(/^data\-/g, '')] = value;
                      }
                    } else {
                      if (name === 'innerHTML') {
                        element.innerHTML = value;
                      } else {
                        element.setAttribute(name, value);
                      }
                    }
                    this.forceUpdate();
                  } catch (ex) {
                    console.error(ex);
                    message.error(ex.message);
                  }
                }}/>
            )
          }
        </Form>
      </Panel>
    )
  }
}
