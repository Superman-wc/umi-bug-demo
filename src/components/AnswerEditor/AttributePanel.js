import React from 'react';
import {Form, Button, Input, InputNumber, Select} from 'antd';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import {Enums} from '../../utils/Enum';


function AttributePanel(props) {

  const {
    attributePanelConfig = {},
    activeElementKey,
    activeColumnKey,
    form: {getFieldDecorator},
    dispatch
  } = props;

  const formProps = {
    layout: 'horizontal',
    className: styles['attribute-panel']
  };

  return (
    <Form {...formProps}>
      {
        Object.entries(attributePanelConfig || {}).map(([key, setting]) =>
          <Form.Item key={key} label={setting.label} labelCol={{span: 8}} wrapperCol={{span: 14}}>
            {
              getFieldDecorator(key, setting.fieldOptions)(
                setting.type === 'number' ?
                  <InputNumber onChange={(value) => {
                    setting.onChange && setting.onChange(value);
                  }}/>
                  :
                  setting.type === 'enum' ?
                    <Select onChange={(value) => {
                      setting.onChange && setting.onChange(value);
                    }}>
                      {
                        Enums(setting.enumClass).map(it =>
                          <Select.Option key={it.value} value={it.value * 1}>{it.name}</Select.Option>
                        )
                      }
                    </Select>
                    :
                    setting.type === 'textarea' ?
                      <Input.TextArea autosize={{minRows: 3, maxRows: 10}} onChange={(e) => {
                        setting.onChange && setting.onChange(e.target.value);
                      }}/>
                      :
                      <Input onChange={(e) => {
                        setting.onChange && setting.onChange(e.target.value);
                      }}/>
              )
            }
          </Form.Item>
        )
      }
      <Form.Item wrapperCol={{offset: 8, span: 14}}>
        <Button onClick={() => {
          dispatch({
            type: namespace + '/removeActiveElement',
            payload: {
              key: activeElementKey
            }
          })
        }}>删除</Button>
      </Form.Item>
      <hr/>
      <Form.Item wrapperCol={{offset: 8, span: 14}}>
        <Button onClick={() => {
          dispatch({
            type: namespace + '/removeActiveColumn',
            payload: {
              key: activeColumnKey
            }
          })
        }}>删除列</Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({
  mapPropsToFields: ({attributePanelConfig = {}}) => {
    return Object.entries(attributePanelConfig || {}).reduce((map, [key, setting]) => {

      if (setting.type === 'textarea') {
        map[key] = Form.createFormField({value: setting.value.replace('<br/>', '\n')});
      } else {
        map[key] = Form.createFormField({value: setting.value});
      }

      return map;
    }, {});
  }
})(AttributePanel);
