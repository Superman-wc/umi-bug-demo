import React, {Component, Fragment, createRef} from 'react';
import {Form, Checkbox, Button, Menu, Icon, Input, InputNumber, Select} from 'antd';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import styles from './answer.less';


export default function MenuChecked({show}) {
  return (
    <Fragment>
      {
        show ?
          <Icon type="check" style={{
            position: 'absolute', right: 0, top: '50%',
            marginTop: -6, color: '#1DA57A'
          }}/>
          :
          null
      }
    </Fragment>
  )
}
