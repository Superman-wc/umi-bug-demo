import React, {Component} from 'react';
import {connect} from 'dva';
import classNames from 'classnames';
import {Empty, Row, Col} from 'antd';
import Keyboard from 'keyboardjs';
import {
  ExaminerRecord as namespace,
} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import Flex from "../../../components/Flex/Flex";
import styles from './style.less';



@connect(state => ({
  englishCompositionAnalyze: state[namespace].englishCompositionAnalyze,
  loading: state[namespace].loading,
}))
export default class EnglishCompositionAnalyzePage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location} = this.props;
    const {query: {recordId}} = location;
    dispatch({
      type: namespace + '/englishCompositionAnalyze',
      payload: {
        recordId: recordId,
      }
    })
  }


  render() {
    const {
      englishCompositionAnalyze, loading, location, dispatch,

    } = this.props;


    const {pathname, query} = location;

    const title = '英语答题卡列表';

    const breadcrumb = ['管理', '答题卡管理', title];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[{key: 'rollback'}]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );


    return (
      <Page header={header} loading={!!loading}>
        {
          englishCompositionAnalyze ?
            <EnglishCompositionAnalyze {...englishCompositionAnalyze} />
            :
            <Empty/>
        }
      </Page>
    );
  }
}


class EnglishCompositionAnalyze extends Component {

  static cid = 0;

  id = 'EnglishCompositionAnalyze-' + EnglishCompositionAnalyze.cid++;

  state = {};

  keyMap = {
    tab: (e) => {
      e.stopPropagation();
      e.preventDefault();
      let {index = -1} = this.state;
      const {suggests = []} = this.props;
      if (suggests && suggests.length) {
        index += 1;
        if (index >= suggests.length) {
          index = 0;
        }
        this.setState({index, coordinate: suggests[index].coordinate});
      }
    }
  };

  bindKey = () => {
    if (Keyboard.bind) {
      Object.entries(this.keyMap).forEach(([key, fn]) => {
        Keyboard.bind(key, fn);
      });
    }
  };

  unBindKey = () => {
    if (Keyboard.unbind) {
      Object.entries(this.keyMap).forEach(([key, fn]) => {
        Keyboard.unbind(key, fn);
      });
    }
  };


  componentDidMount() {
    this.bindKey();
  }

  componentWillUnmount() {
    this.unBindKey();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const panel = document.getElementById(this.id+'-panel');
    const selectedModifySuggest = panel.querySelector('.'+styles['selected']);
    if(selectedModifySuggest && selectedModifySuggest.scrollIntoView){
      selectedModifySuggest.scrollIntoView();
    }

  }

  render() {
    const {
      url, suggests = [], imageWidth,
    } = this.props;

    const {coordinate = []} = this.state;

    const ratio = 600 / imageWidth;

    return (
      <Flex>
        <Flex.Item>
          <div className={styles['image-box']}>
            {
              url ?
                <img src={url} style={{width: 600}}/>
                :
                <Empty description="缺少图片地址"/>
            }

            {
              suggests && suggests.length ?
                suggests.map(({coordinate = []}, index) =>
                  <div key={index} className={styles['coordinate-group']}>
                    {
                      coordinate && coordinate.length ? coordinate.map(({x, y, w, h}) =>
                          <span className={styles['coordinate']} key={[x, y, w, h].join('-')}
                                style={{left: x * ratio, top: y * ratio, width: w * ratio, height: h * ratio}}/>
                        )
                        :
                        null
                    }
                  </div>
                )
                :
                null
            }

            {
              coordinate && coordinate.length ? coordinate.map(({x, y, w, h}) =>
                  <span className={styles['selected-coordinate']} key={[x, y, w, h].join('-')}
                        style={{left: x * ratio, top: y * ratio, width: w * ratio, height: h * ratio}}/>
                )
                :
                null
            }
          </div>
        </Flex.Item>
        <Flex id={this.id + '-panel'} direction="column"  className={styles['analyze-box']}>
          <div>
            <h3>学生信息：</h3>
            <Row className={styles['analyze-info']}>
              <Col span={12}>
                <AnalyzeInfoItem label="姓名" value={this.props.studentName}/>
                <AnalyzeInfoItem label="学号" value={this.props.studentCode}/>
              </Col>
              <Col span={12}>
                <img src={this.props.studentAvatar} width={60} />
              </Col>
            </Row>
          </div>
          <div>
            <h3>基本信息：</h3>
            <Row className={styles['analyze-info']}>
              {
                Object.entries({
                  compositionSentences: '句子数量',
                  sentenceLength: '平均句子长度',
                  compositionWords: '单词数量',
                  wordLength: '平均单词长度',
                  uniqueWords: '词汇多样性',
                  rareWords: '高级词汇'
                }).map(([key, label]) =>
                  <Col key={key} span={12}>
                    <AnalyzeInfoItem label={label} value={this.props[key]}/>
                  </Col>
                )
              }

            </Row>
          </div>
          <Flex className={styles['suggest-panel']}>
            <h3>修改建议：</h3>
            <ul className={styles['scroll-view']}>
              {
                suggests.map((suggest, index) =>
                  <ModifySuggest
                    key={index}
                    {...suggest}
                    selected={this.state.index === index}
                    index={index}
                    onClick={(index, coordinate) => {
                      this.setState({index, coordinate});
                    }}/>
                )
              }
            </ul>
          </Flex>

        </Flex>
      </Flex>
    )
  }
}

function AnalyzeInfoItem({label, value}) {
  return (
    <div className={styles['analyze-info-item']}>
      <label>{label}</label>
      <span>{value}</span>
    </div>
  )
}

function ModifySuggest(props) {
  const {index, selected, explanation, modifyText, replacementTexts = [], coordinate = [], onClick} = props;

  return (
    <li className={classNames(styles['modify-suggest'], {[styles['selected']]: selected})} onClick={() => {
      onClick && onClick(index, coordinate);
    }}>
      <div className={styles['modify-suggest-content']}>
        {
          modifyText ?
            <s>{modifyText}</s>
            :
            null
        }
        {
          replacementTexts.map((it, index) =>
            <strong key={index}>{it}</strong>
          )
        }
      </div>
      <div className={styles['modify-suggest-explanation']} dangerouslySetInnerHTML={{__html: explanation}}/>
    </li>
  );
}
