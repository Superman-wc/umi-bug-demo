import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Form, Tree, Spin, Icon} from 'antd';
import {connect} from 'dva';
import {URLResourceCategoryEnum, URLResourceEnum, EnableStatusEnum} from '../../utils/Enum';
import {AdminUrlResource, AdminAuthority} from '../../utils/namespace';

import {Actions} from '../../utils/ResourceActions';


@Form.create({
  // mapPropsToFields: props => props
})
@connect(state => ({
  urlResourceMap: state[AdminUrlResource].map,
  loading: state[AdminAuthority].loading,
  item: state[AdminAuthority].item
}))
export default class UrlResourceTreeModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    item: PropTypes.object,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
  };

  constructor() {
    super(...arguments);
    this.state = {checkedKeys: []};
  }

  componentWillMount() {
    this.props.dispatch({
      type: AdminUrlResource + '/all',
      payload: {
        appId: this.props.appId
        // status: EnableStatusEnum.启用
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const {item} = nextProps;
    if (item) {
      if (item.permissions) {
        const checkedKeys = [];
        Object.keys(item.permissions).forEach(cn => {
          const mask = item.permissions[cn];
          Actions.forEach(a => {
            if ((mask & a.mask) === a.mask) {
              checkedKeys.push(['a', cn, a.mask].join('-'));
            }
          });
        });
        this.setState({checkedKeys});
      }
    }
  }


  render() {

    const {
      onOk, onCancel, item, visible,
      loading,
      urlResourceMap,
    } = this.props;

    const title = (
      <span>
        <span>为角色</span>
          <strong style={{color: '#00f'}}>
            {item && (item.description + '[' + item.id + ']') || ''}
          </strong>
        <span>分配权限</span>
        {
          loading ?
            <Icon type="loading"/>
            :
            null
        }
      </span>
    );

    const modalProps = {
      title,
      width: 600,
      visible,
      onCancel,
      onOk: () => {
        const permissions = {};
        this.state.checkedKeys.forEach(key => {
          const [ka, cn, mask] = key.split('-');
          if (ka === 'a' && mask) {
            permissions[cn] = (permissions[cn] || 0) + parseInt(mask, 10);
          }
        });
        onOk && onOk({permissions: JSON.stringify(permissions)});
      }
    };

    const treeProps = {
      checkable: true,
      defaultExpandAll: true,
      checkedKeys: this.state.checkedKeys,
      onCheck: checkedKeys => this.setState({checkedKeys})
    };

    return (
      <Modal {...modalProps}>
        <Spin spinning={!!loading}>
          <Form layout="horizontal">
            {
              urlResourceMap ?
                <Tree {...treeProps}>
                  {
                    Object.keys(urlResourceMap).sort((a, b) => b - a).map((category) =>
                      <Tree.TreeNode className="resource-category" key={['c', category].join('-')}
                                     title={category}
                                     /*title={URLResourceCategoryEnum[category]}*/>
                        {
                          urlResourceMap[category].map(it => {
                            return it.actions.length ?
                              it.actions.length === 1 ?
                                <Tree.TreeNode className="resource-item"
                                               key={['a', it.controllerName, it.actions[0].value].join('-')}
                                               title={[(it.description + it.controllerName), URLResourceEnum[it.actions[0].value]].join(' - ')}/>
                                :
                                <Tree.TreeNode className="resource-item" key={['i', it.id].join('-')}
                                               title={it.description + it.controllerName}
                                               disabled={it.status*1 === EnableStatusEnum.禁用}>
                                  {
                                    it.actions.length ?
                                      it.actions.map(action =>
                                        <Tree.TreeNode className="resource-action"
                                                       key={['a', it.controllerName, action.value].join('-')}
                                                       title={URLResourceEnum[action.value]}
                                                       disabled={it.status*1 === EnableStatusEnum.禁用}/>
                                      )
                                      :
                                      null
                                  }
                                </Tree.TreeNode>
                              :
                              <Tree.TreeNode className="resource-item" key={['i', it.id].join('-')}
                                             title={it.description + it.controllerName}
                                             disabled={it.status*1 === EnableStatusEnum.禁用}/>
                          })
                        }
                      </Tree.TreeNode>
                    )
                  }
                </Tree>
                :
                null
            }
          </Form>
        </Spin>
      </Modal>
    );
  }
}
