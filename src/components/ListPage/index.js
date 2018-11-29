import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Table} from 'antd';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import Page from '../Page';
import PageHeaderOperation from '../Page/HeaderOperation';
import './ListPage.less';


/**
 * 默认的分页组件配置
 * @param query
 * @param total
 * @returns {{total: *, pageSize: (Number|number), current: (Number|number), showSizeChanger: boolean, showTotal: (function(*): string), pageSizeOptions: string[]}}
 */
export function paginationConfig(query, total) {
  return {
    total: total,
    pageSize: parseInt(query.s, 10) || 30,
    current: parseInt(query.p, 10) || 1,
    showSizeChanger: true,
    showTotal: total => `共 ${total} 条`,
    pageSizeOptions: ['10', '30', '50', '100'],
  };
}

export function stdColumns(cols) {
  return cols.map(col => {
    if (
      (col.key === 'operation' || col.key === 'operate') &&
      typeof col.dataIndex === 'undefined'
    ) {
      col.dataIndex = 'id';
    }
    if (
      col.key === 'created_at' ||
      col.key === 'updated_at' ||
      col.key === 'dateCreated' ||
      col.key === 'date_created' ||
      col.key === 'last_updated' ||
      col.key === 'lastUpdated' ||
      col.type === 'dateTime'
    ) {
      col.render = v => (v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '');
      if (typeof col.width === 'undefined') {
        col.width = 120;
      }
    }
    if (typeof col.dataIndex === 'undefined') {
      col.dataIndex = col.key;
    }
    if (col.tac !== false) {
      col.className = (col.className || '') + ' tac';
    }

    if (typeof col.width === 'undefined') {
      col.width = 60;
    }

    return col;
  });
}

@connect()
export default class ListPage extends Component {
  static propTypes = {
    list: PropTypes.array,
    total: PropTypes.number,
    loading: PropTypes.bool,
    columns: PropTypes.array,
    breadcrumb: PropTypes.array,
    title: PropTypes.string,
    operations: PropTypes.array,
    headerChildren: PropTypes.any,
    location: PropTypes.object,
    pagination: PropTypes.bool,
    scrollHeight: PropTypes.number,
    rowClassName: PropTypes.func,
    rowKey: PropTypes.string,
  };

  render() {
    const {
      list,
      total,
      loading,
      columns,
      breadcrumb,
      title,
      operations,
      headerChildren,
      dispatch,
      location: {query, pathname},
      pagination,
      scrollHeight = 175,
      children,
      rowClassName,
      rowKey = 'id',
    } = this.props;

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={operations}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}>
        {headerChildren}
      </Page.Header>
    );
    const handleTableChange = (pagination, filters, sorter) => {
      let _query = {...query};
      Object.keys(filters).forEach(key => {
        if (filters[key].length) {
          _query[key] = filters[key].join(',');
        } else {
          delete _query[key];
        }
      });
      _query.p = pagination.current;
      _query.s = pagination.pageSize;
      const __query = this.props.onChange && this.props.onChange(pagination, filters, sorter) || {};
      dispatch(routerRedux.replace({pathname, query: {..._query, ...__query}}));
    };
    return (
      <Page header={header} loading={!!loading}>
        <div className="list-page-main">
          {children}
          <div className="list-table-container">
            <Table
              className="list-table"
              bordered
              columns={stdColumns(columns)}
              dataSource={Array.isArray(list) ? list : []}
              pagination={pagination ? paginationConfig(query, total) : false}
              onChange={handleTableChange}
              scroll={{y: window.innerHeight - (pagination ? scrollHeight : 125)}}
              rowClassName={rowClassName}
              rowKey={rowKey}
            />
          </div>
        </div>
      </Page>
    );
  }
}
