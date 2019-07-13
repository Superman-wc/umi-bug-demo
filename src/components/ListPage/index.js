import React, {Component, Fragment, createRef} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Table, Pagination} from 'antd';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import Page from '../Page';
import PageHeaderOperation from '../Page/HeaderOperation';
import styles from './ListPage.less';
import {Env} from "../../utils/namespace";


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
      col.key === 'releaseTime' ||
      col.type === 'dateTime'
    ) {
      col.render = v => (v ? moment(v).format(col.format || 'YYYY-MM-DD HH:mm:ss') : '');
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

@connect(state => ({
  env: state[Env],
}))
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

  _refListMain = createRef();

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
      env,
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

    const _columns = stdColumns(columns) || [];

    return (
      <Page header={header} loading={!!loading} className={styles['list-page']}>
        {
          env.inElectron ?
            <Fragment>
              <section className={styles['list']}>
                <header>
                  {
                    _columns && _columns.length ?
                      _columns.map(it =>
                        <Col key={it.key} className={it.className} width={it.width}>{it.title}</Col>
                      )
                      :
                      null
                  }
                </header>
                <main ref={this._refListMain}>
                  <ul>
                    {
                      list && list.length ?
                        list.map((item, index) =>
                          <li key={item[rowKey]}>
                            {
                              _columns && _columns.length ?
                                _columns.map(col =>
                                  <Col key={col.key} className={col.className} width={col.width}>
                                    {
                                      col.render ?
                                        col.render(item[col.dataIndex], item, index)
                                        :
                                        item[col.dataIndex]
                                    }
                                  </Col>
                                )
                                :
                                null
                            }
                          </li>
                        )
                        :
                        null
                    }
                  </ul>
                </main>
                <footer>
                  {
                    pagination && <Pagination {...paginationConfig(query, total)} onChange={(current, pageSize) => {
                      handleTableChange({current, pageSize}, {}, {});
                      this._refListMain.current.scrollTo(0,0);
                    }} onShowSizeChange={(current, pageSize) => {
                      handleTableChange({current, pageSize}, {}, {});
                      this._refListMain.current.scrollTo(0,0);
                    }}/>
                  }
                </footer>
              </section>
              {children}
            </Fragment>
            :
            <div className="list-page-main">
              {children}
              <div className="list-table-container">
                <Table
                  className="list-table"
                  bordered
                  columns={_columns}
                  dataSource={Array.isArray(list) ? list : []}
                  pagination={pagination ? paginationConfig(query, total) : false}
                  onChange={handleTableChange}
                  scroll={{y: window.innerHeight - (pagination ? scrollHeight : 125)}}
                  rowClassName={rowClassName}
                  rowKey={rowKey}
                />
              </div>
            </div>
        }
      </Page>
    );
  }
}

function Col({children, className, width}) {
  const style = {};
  if (width) {
    if (width === 'auto') {
      style.flex = '1';
      style.minWidth = '20%';
    } else {
      style.width = width;
    }
  }
  return (
    <div className={className} style={style}>{children}</div>
  )
}
