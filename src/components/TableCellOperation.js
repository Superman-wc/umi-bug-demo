import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';
import { Popconfirm } from 'antd';
import Separate from './Separate';

const OperationType = {
  modify: '修改',
  remove: '删除',
  create: '创建',
  add: '添加',
  look: '查看',
  detail: '详情',
  allot: '分配',
  relate: '关联',
  edit: '编辑',
  preview: '预览',
  publish: '发布',
  offline: '下线'
};

export default function TableCellOperation({ children, operations = {} }) {
  return (
    <span>
      {Object.keys(operations)
        .map(key => {
          const it = operations[key];
          if (!it || it.hidden) {
            return null;
          } else if (typeof it === 'function') {
            return (
              <a
                key={key}
                href={'javascript:void("' + OperationType[key] + '")'}
                onClick={it}
                children={OperationType[key]}
              />
            );
          } else if (typeof it === 'string') {
            return <Link key={key} children={OperationType[key]} to={it} />;
          } else if (it.to) {
            return <Link key={key} children={OperationType[key]} {...it} />;
          } else if (it.onConfirm) {
            const onConfirm = it.onConfirm;
            delete it.onConfirm;
            let title = '';
            it.children = it.children || OperationType[key];
            if (typeof it.children === 'string') {
              it.href = 'javascript:void("' + it.children + '")';
              title = it.children;
            } else {
              it.href = 'javascript:void("' + (OperationType[key] || '') + '")';
              title = OperationType[key] || '';
            }
            title = '确定要' + title + '吗？';
            return (
              <Popconfirm key={key} title={title} onConfirm={onConfirm}>
                <a {...it} />
              </Popconfirm>
            );
          } else {
            return (
              <a
                key={key}
                href={'javascript:void("' + (it.children || OperationType[key]) + '")'}
                {...it}
              />
            );
          }
        })
        .concat(children)
        .filter(it => !!it)
        .reduce((arr, it, index, array) => {
          if (it instanceof Component && !it.key) {
            it.key = 'operation-' + index;
          }
          arr.push(it);
          if (index < array.length - 1) {
            arr.push(<Separate key={'separate-' + index} />);
          }
          return arr;
        }, [])}
    </span>
  );
}

TableCellOperation.propTypes = {
  operations: PropTypes.object,
};
