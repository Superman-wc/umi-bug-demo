import React, {Component} from 'react';
import {Row, Col, Select} from 'antd';
import Flex from '../Flex';
import styles from './GradeClassSelector.less';


export default class GradeClassSelector extends Component{

  render(){

    const {
      gradeList = [], classList = [], courseList = [],
      onGradeChange, onClassChange, onCourseChange
    } = this.props;

    return (
      <div className={styles['filter-box']}>
        <Row>
          {/*<Col span={8}>*/}
            {/*<Flex>*/}
              {/*<h3>学校</h3>*/}
              {/*<Flex.Item>*/}
                {/*<Select style={{width: '90%'}} placeholder="请选择学校">*/}
                  {/*<Select.Option key={0}>请选择学校</Select.Option>*/}
                {/*</Select>*/}
              {/*</Flex.Item>*/}
            {/*</Flex>*/}
          {/*</Col>*/}
          <Col span={8}>
            <Flex>
              <h3>年级</h3>
              <Flex.Item>
                <Select style={{width: '90%'}} placeholder="请选择年级" onChange={onGradeChange}>
                  {
                    gradeList.map(it =>
                      <Select.Option key={it.id}>{it.name}#{it.id}</Select.Option>
                    )
                  }
                </Select>
              </Flex.Item>
            </Flex>
          </Col>
          {
            classList && classList.length ?
              <Col span={8}>
                <Flex>
                  <h3>班级</h3>
                  <Flex.Item>
                    <Select style={{width: '90%'}} placeholder="请选择班级" onChange={onClassChange}>
                      {
                        classList.map(it =>
                          <Select.Option key={it.id}>{it.name}#{it.num}</Select.Option>
                        )
                      }
                    </Select>
                  </Flex.Item>
                </Flex>
              </Col>
              :
              null
          }
          {
            courseList && courseList.length ?
              <Col span={8}>
                <Flex>
                  <h3>学科</h3>
                  <Flex.Item>
                    <Select style={{width: '90%'}} placeholder="请选择学科" onChange={onCourseChange}>
                      <Select.Option key="0">全部</Select.Option>
                      {
                        courseList.map(it =>
                          <Select.Option key={it.id}>{it.name}</Select.Option>
                        )
                      }
                    </Select>
                  </Flex.Item>
                </Flex>
              </Col>
              :
              null
          }
        </Row>
      </div>
    );
  }
}
