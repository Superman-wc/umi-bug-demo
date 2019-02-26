import React from 'react';
import {Form, Button, Input, InputNumber} from 'antd';
import styles from './answer.less';



function AttributePanel(props) {

  const {config = {}, form: {getFieldDecorator}, onDelete} = props;

  const formProps = {
    layout: 'horizontal',
    className: styles['attribute-panel']
  };

  return (
    <Form {...formProps}>
      {
        Object.entries(config).map(([key, setting]) =>
          <Form.Item key={key} label={setting.label} labelCol={{span: 8}} wrapperCol={{span: 14}}>
            {
              getFieldDecorator(key, setting.fieldOptions)(
                setting.type === 'number' ?
                  <InputNumber onChange={(value) => {
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
      <Form.Item wrapperCol={{offset: 8, span: 14}}>
        <Button onClick={onDelete}>删除</Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({
  mapPropsToFields: ({config}) => {
    return Object.entries(config).reduce((map, [key, setting]) => {
      map[key] = Form.createFormField({value: setting.value});
      return map;
    }, {});
  }
})(AttributePanel);
