import React, {Component, Fragment, createRef} from 'react';
import {Form, Checkbox, Button, Menu, Icon, Input, InputNumber, Select} from 'antd';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import styles from './answer.less';
import PaddingEditor from "./PaddingEditor";
import {PAGE_SIZE} from "./const";
import {AnswerEditor as namespace} from "../../utils/namespace";


function CreateFilePanel(props) {

  const {dispatch, form: {getFieldDecorator, validateFieldsAndScroll}} = props;

  const wrapper = {labelCol: {span: 8}, wrapperCol: {span: 14}};

  const formProps = {
    layout: 'horizontal',
    className: styles['create-file-panel'],
    hideRequiredMark: true,
    onSubmit: (e) => {
      e.preventDefault();
      e.stopPropagation();
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          console.error(errors);
        } else {
          console.log(payload);
          dispatch({
            type: namespace + '/createFile',
            payload
          })
        }
      })
    }
  };

  const itemMap = {
    content: {
      title: {
        label: '考试或作业名称',
        help: '例如：2019年杭州第十四中学康桥校区高一年级暑假作业检测',
        ...wrapper,
        fieldOptions: {
          initialValue: '这是测试用的',
          rules: [{required: true, message: '必须填写'}]
        },
        children: <Input placeholder="请输入考试或作业名称"/>
      },
      choiceCount: {
        label: '选择题数量',
        help: '判断题、单选题、多选题统一设置数量',
        ...wrapper,
        fieldOptions: {
          initialValue: 30,
          rules: [{required: true, message: '必须填写'}]
        },
        children: <InputNumber style={{width: 60}} min={0} max={100}/>
      },
      completionCount: {
        label: '填空题数量',
        help: '此项指填空题大题数量，自动生成每大题下3个小题',
        ...wrapper,
        fieldOptions: {
          initialValue: 5,
          rules: [{required: true, message: '必须填写'}]
        },
        children: <InputNumber style={{width: 60}} min={0} max={20}/>
      },
      answerCount: {
        label: '解答题数量',
        help: '需要较大范围用于填写答案的都计为此项',
        ...wrapper,
        fieldOptions: {
          initialValue: 1,
          rules: [{required: true, message: '必须填写'}]
        },
        children: <InputNumber style={{width: 60}} min={0} max={20}/>
      }
    },
    print: {
      dpi: {
        label: '分辨率',
        help: '此项视打印机情况而定，一般为96DPI',
        ...wrapper,
        fieldOptions: {
          initialValue: 96,
          rules: [{required: true, message: '必须填写'}]
        },
        children: (
          <Select style={{width: 90}}>
            {
              [72, 96, 120, 300].map((value) =>
                <Select.Option key={value} value={value}>{value}</Select.Option>
              )
            }
          </Select>
        )
      },
      type: {
        label: '纸张大小',
        help: '纸张大小设置应于打印时设置一致',
        ...wrapper,
        fieldOptions: {
          initialValue: 'A4',
          rules: [{required: true, message: '必须填写'}]
        },
        children: (
          <Select style={{width: 220}}>
            {
              Object.entries(PAGE_SIZE).map(([key, page]) =>
                <Select.Option key={key}
                               value={key}>{`${key} (${page.print.width}x${page.print.height}mm ${page.direction})`}</Select.Option>
              )
            }
          </Select>
        )
      },
      padding: {
        label: '纸张边距',
        help: '纸张边缘留白部分，设置后打印机的边距请设置成"无"',
        ...wrapper,
        fieldOptions: {
          initialValue: [60, 45, 60, 45],
          rules: [{required: true, message: '必须填写'}]
        },
        children: <PaddingEditor/>
      },
      colCount: {
        label: '纸张分列数量',
        help: 'A4、16K建议1列，8K建议2列',
        ...wrapper,
        fieldOptions: {
          initialValue: 1,
          rules: [{required: true, message: '必须填写'}]
        },
        children: <InputNumber style={{width: 60}} max={3} min={1}/>
      },
      colSpan: {
        label: '分列间距',
        help: '列与列有间距',
        ...wrapper,
        fieldOptions: {
          initialValue: 30,
          rules: [{required: true, message: '必须填写'}]
        },
        children: <InputNumber style={{width: 60}} max={100} min={0}/>
      },
    }
  };

  return (
    <Form {...formProps}>
      {
        Object.entries(itemMap).map(([group, items], index) =>
          <Fragment key={group}>
            {
              index ?
                <hr style={{marginBottom: '2em'}}/>
                :
                null
            }
            {
              Object.entries(items).map(([key, {fieldOptions, children, ...itemProps}]) =>
                <Form.Item key={key} {...itemProps}>
                  {
                    getFieldDecorator(`${group}.${key}`, fieldOptions)(children)
                  }
                </Form.Item>
              )
            }
          </Fragment>
        )
      }
      <Form.Item wrapperCol={{offset: 8, span: 14}}>
        <Button type="primary" htmlType="submit" style={{width: 120}}>创建</Button>
        <Button type="danger" htmlType="reset" style={{width: 120, marginLeft: '1em'}}>重置</Button>
      </Form.Item>
    </Form>
  );
}

export default Form.create()(CreateFilePanel)
