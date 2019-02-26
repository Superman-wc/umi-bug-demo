import {connect} from 'dva';
import {Menu, Icon,} from 'antd';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";

function EditorHeader(props) {

  const {file, dispatch, activePageKey, activeColumnKey} = props;

  const menu = [
    {
      key: 'file', icon: 'mail', title: '文件',
      items: [
        {key: 'newFile', title: '新建'},
        {key: 'open', title: '打开'},
        {key: 'save', title: '保存', disabled: !file},
        {key: 'save-as', title: '另存为', disabled: !file},
        {key: 'print', title: '打印', disabled: !file},
      ]
    }, {
      key: 'insert', icon: 'appstore', title: '插入', disabled: !file,
      items: [
        {key: 'addPage', title: '添加纸张'},
        {key: 'addColumn', title: '添加列', disabled: !activePageKey},
        {key: 'page-title', title: '标题'},
        {key: 'student-info', title: '学生信息'},
        {key: 'choice-question', title: '选择题'},
        {key: 'completion-question', title: '填空题'},
        {key: 'answer-question', title: '解答题'}
      ]
    }
  ];

  const menuProps = {
    className: styles['editor-menu'],
    mode: 'horizontal',
    selectable: false,
    onClick: ({key, keyPath}) => {
      dispatch({
        type: namespace + '/' + key,
        payload: {
          key, keyPath,
        }
      });
    }
  };

  return (
    <section className={styles['editor-header']}>
      <Menu {...menuProps}>
        {
          menu.map(sm =>
            <Menu.SubMenu key={sm.key} disabled={sm.disabled}
                          title={<span><Icon type={sm.icon}/><span>{sm.title}</span></span>}>
              {
                sm.items.map(it =>
                  <Menu.Item key={it.key} disabled={sm.disabled || it.disabled}>{it.title}</Menu.Item>
                )
              }
            </Menu.SubMenu>
          )
        }
      </Menu>
    </section>
  )
}

export default connect(state => ({
  file: state[namespace].file,
  activePageKey: state[namespace].activePageKey,
  activeColumnKey: state[namespace].activeColumnKey,
}))(EditorHeader);
