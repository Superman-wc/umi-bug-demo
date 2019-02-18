import React from 'react';
import { Form, Input} from 'antd';
import ColorPicker from '../ColorPicker';

export default function AttributeEditor(props) {
  const {attribute, onChange} = props;
  return (
    <Form.Item key={attribute.name}
               label={attribute.label||attribute.name} {...props.wrap}>
      {
        attribute.type === 'color' ?
          <ColorPicker value={attribute.value} onChange={color => {
            onChange({name: attribute.name, value: color});
          }}/>
          :

          <Input value={attribute.value} onChange={(e) => {
            onChange({name: attribute.name, value: e.target.value});
          }}/>
      }
    </Form.Item>
  )
}



function NumberAttributeEditor({value, onChange}) {
  return (
    <Input value={value} onChange={onChange}/>
  )
}
