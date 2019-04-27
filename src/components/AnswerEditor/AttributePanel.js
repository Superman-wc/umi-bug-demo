import React, {Component} from 'react';
import {Form, Button, Input, InputNumber, Select} from 'antd';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import {Enums} from '../../utils/Enum';

function AttributePanel(props) {

  const {
    attributePanelConfig = {},
    activeElementKey,
    activeColumnKey,
    score = 0,
    form: {getFieldDecorator},
    dispatch
  } = props;

  const formProps = {
    layout: 'horizontal',
    className: styles['attribute-panel']
  };

  console.log(attributePanelConfig);


  return (
    <Form {...formProps}>
      {
        Object.entries(attributePanelConfig || {}).map(([key, setting]) =>
          <Form.Item key={key} label={setting.label} labelCol={{span: 6}} wrapperCol={{span: 14}}>
            {
              getFieldDecorator(key, setting.fieldOptions)(
                setting.type === 'number' ?
                  <InputNumber {...setting.props} onChange={(value) => {
                    if (typeof value === 'number') {
                      if (setting.props) {
                        if (typeof setting.props.max === "number") {
                          value = Math.min(value, setting.props.max);
                        }
                        if (typeof setting.props.min === "number") {
                          value = Math.max(setting.props.min, value);
                        }
                      }
                      //(setting.props && setting.props.min)
                      setting.onChange && setting.onChange(value);
                    }
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
                      setting.type === 'Array[string]' ?
                        <ArrayInput count={attributePanelConfig.count.value} onChange={(value) => {
                          console.log(value);
                          setting.onChange && setting.onChange(value);
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
      <Form.Item wrapperCol={{offset: 6, span: 14}}>
        <Button onClick={() => {
          dispatch({
            type: namespace + '/removeActiveElement',
            payload: {
              key: activeElementKey
            }
          })
        }}>删除</Button>
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

class ArrayInput extends Component {
  render() {

    const {value = [], onChange, count = 1} = this.props;

    return (
      <div>
        {
          new Array(count).fill('').map((it, index) =>
            <div key={index}>
              <Input
                placeholder={`第${index + 1}小题`}
                value={value[index]}
                onChange={e => {
                  value[index] = e.target.value;
                  onChange && onChange(value);
                }}/>
            </div>
          )
        }
      </div>
    )
  }
}
