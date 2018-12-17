import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Form, Select} from 'antd';

import SearchSuggestBox from '../SearchSuggestBox/index';
import searchSuggestBoxStyles from '../SearchSuggestBox/index.less';
import {connect} from 'dva';

import {AdminUrlResource as namespace} from '../../utils/namespace';

export function filter(su, search) {
  return su.label.indexOf(search) >= 0 ||
    su.code.indexOf(search) >= 0 ||
    su.pinyin.indexOf(search) >= 0 ||
    su.province.indexOf(search) >= 0
}


@connect(state => ({
  loading: state[namespace].loading,
  suggest: state[namespace].all,
}))
export default class UrlResourceSearchBox extends Component {

  static propTypes = {
    onChange: PropTypes.func,
    valueField: PropTypes.string,
  };

  constructor() {
    super(...arguments);
    this.state = {
      search: ''
    };
  }

  render() {

    const {suggest, onChange, valueField = 'name'} = this.props;

    const handleChange = (search, callback) => {
      clearTimeout(this.__handleChange__sid);
      this.__handleChange__sid = setTimeout(() => {
        callback((search && suggest && suggest.length) ? suggest.filter(su => {
          return filter(su, search.toUpperCase())
        }) : null);
      }, 300);
    };

    const handleSubmit = search => {
      this.setState({search});
      onChange && onChange(search);
    };

    const renderSuggestItem = (su, search) => {
      return (
        <Select.Option key={su.id} value={su[valueField]}>
          <Row className={searchSuggestBoxStyles["search-suggest-text"]}>
            <Col span="4"><span
              dangerouslySetInnerHTML={{__html: su.code.replace(search, '<b>' + search + '</b>')}}/></Col>
            <Col span="10"><span
              dangerouslySetInnerHTML={{__html: su.name.replace(search, '<b>' + search + '</b>')}}/></Col>
            <Col span="5"><span
              dangerouslySetInnerHTML={{__html: su.pinyin.replace(new RegExp(search, 'i'), '<b>' + search.toUpperCase() + '</b>')}}/></Col>
            <Col span="5" style={{textAlign: 'right'}}><span
              dangerouslySetInnerHTML={{__html: su.province.replace(search, '<b>' + search + '</b>')}}/></Col>
          </Row>
        </Select.Option>
      );
    };

    let _suggest = [];

    if (suggest && suggest.length) {
      _suggest = suggest.reduce((map, it) => {
        map[it[valueField]] = it;
        return map;
      }, {});

      _suggest = Object.keys(_suggest).reduce((arr, key) => {
        arr.push(_suggest[key]);
        return arr;
      }, []);
    }


    return (
      <Form layout="horizontal">
        <Form.Item style={{marginBottom: 0}}>
          <SearchSuggestBox renderSuggestItem={renderSuggestItem}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            suggest={_suggest}/>
        </Form.Item>
      </Form>
    );
  }
}
