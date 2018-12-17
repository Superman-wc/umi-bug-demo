import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Form, Transfer, Spin, Icon} from 'antd';
import {connect} from 'dva';
import {EnableStatusEnum} from '../utils/Enum';
import {AdminAuthority} from '../utils/namespace';


@Form.create({
  // mapPropsToFields: props => props
})
@connect(state => ({
  all: state[AdminAuthority].all,
  loading: state[AdminAuthority].loading,
}))
export default class AllotAuthorityModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    item: PropTypes.object,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
  };

  state = {targetKeys: [], selectedKeys: []};

  componentDidMount() {
    this.props.dispatch({
      type: AdminAuthority + '/all',
      payload: {s: 10000, p: 1, appId: this.props.item.appId}
    });
  }

  componentWillReceiveProps(nextProps) {
    const {item} = nextProps;
    if (item && item.authorities) {
      this.setState({targetKeys: item.authorities.map(it => it.id)});
    }
  }


  render() {

    const {
      all,
      onOk, onCancel, item = {}, visible,
      loading,
    } = this.props;


    const dataSource = all && all.reduce((arr, it) => {
      arr.push({
        key: it.id,
        title: it.description,
        disabled: it.status*1 === EnableStatusEnum.禁用
      });
      return arr;
    }, []) || [];

    const handleChange = (nextTargetKeys, direction, moveKeys) => {
      this.setState({targetKeys: nextTargetKeys});
    };
    const handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
      this.setState({selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]});
    };

    return (
      <Modal title={
        <span>
          为用户
          <strong style={{color: '#00f'}}>
            {item && (item.nick || item.username) || ''}
          </strong>
          分配角色
          {loading ? <Icon type="loading"/> : null}
        </span>
      }
             visible={visible} confirmLoading={!!loading}
             onOk={() => {
               onOk && onOk({id: item.id, authorities: this.state.targetKeys.join(',')});
             }}
             onCancel={onCancel}>
        <Spin spinning={!!loading}>
          {
            all &&
            <Transfer
              dataSource={dataSource}
              titles={['所有角色', '用户角色']}
              targetKeys={this.state.targetKeys}
              selectedKeys={this.state.selectedKeys}
              onChange={handleChange}
              onSelectChange={handleSelectChange}
              render={item => item.title}
            />
          }
        </Spin>
      </Modal>
    );
  }
}
