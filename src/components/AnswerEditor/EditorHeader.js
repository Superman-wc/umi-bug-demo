import {connect} from 'dva';
import {Menu, Icon, message} from 'antd';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import router from 'umi/router';

function EditorHeader(props) {

  const {query, file, dispatch, activePageKey, activeColumnKey} = props;


  const menu = [
    {
      key: 'file', icon: 'mail', title: '文件', disabled: query.readOnly,
      items: [
        {key: 'newFile', title: '新建'},
        {key: 'open', title: '打开'},
        {key: 'save', title: '保存', disabled: !file},
        {key: 'save-as', title: '另存为', disabled: !file},
        {key: 'print', title: '打印', disabled: !file},
        // {key: 'saveToPDF', title: '保存成PDF', disabled: !file}
      ]
    }, {
      key: 'insert', icon: 'appstore', title: '插入', disabled: !file || query.readOnly,
      items: [
        {key: 'addPage', title: '添加纸张'},
        {key: 'addColumn', title: '添加列', disabled: !activePageKey},
        {key: 'addTitleBox', title: '标题', disabled: !activeColumnKey},
        {key: 'addStudentInfoBox', title: '学生信息', disabled: !activeColumnKey},
        {key: 'addChoiceQuestion', title: '选择题', disabled: !activeColumnKey},
        {key: 'addCompletionQuestion', title: '填空题', disabled: !activeColumnKey},
        {key: 'addAnswerQuestion', title: '解答题', disabled: !activeColumnKey},
        {key: 'addEnglishCompositionQuestion', title: '英语作文题', disabled: !activeColumnKey}
      ]
    }
  ];

  const menuProps = {
    className: styles['editor-menu'],
    mode: 'horizontal',
    selectable: false,
    onClick: ({key, keyPath}) => {
      console.log(key, keyPath);
      dispatch({
        type: namespace + '/' + key,
        payload: {
          key, keyPath,
        },
        resolve: (res) => {
          if (key === 'save') {  // is effect
            console.log(res);
            message.success('保存成功');
            if (!props.query.id || props.query.id * 1 !== res.id) {
              router.replace({pathname: props.pathname, query: {...props.query, id: res.id}});
            }
          }
        }
      });
      if (key === 'newFile') { // not is effect
        router.replace({pathname: props.pathname, query: {...props.query, id: undefined}});
      }
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
