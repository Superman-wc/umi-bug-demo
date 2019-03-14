
import React from 'react'
import { connect } from 'dva';
import { Form, Input, Row, Col, message, Modal, Select, notification, Spin, Button } from 'antd';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import ExamTable from '../../../components/exam/ExamTable'
import TeacherTable from '../../../components/exam/TeacherTable'
import styles from './index.less'
import { ExamDetail as namespace } from '../../../utils/namespace';
import { ExamStatusEnum, GradeIndexEnum, ExamTypeEnum, Enums, getNameByValue } from '../../../utils/Enum'

@connect(state => ({
  examDetail: state[namespace].examDetail,
  examName: state[namespace].examName,
}))
export default class ExamDetail extends React.Component {

  state = {
    value: null
  }

  // 编辑考场
  // edit = () => {
  // }

  // 导出考场
  importTable = () => {
  }

  // 导出教师监考
  // importTeacherTable = () => {
  // }

  onSearch(value) {
    this.setState({
      value: value
    })
  }

  render() {
    const Search = Input.Search;
    const { examName, examDetail = {}, location } = this.props;
    const { query } = location;
    const canEdit = query.releaseStatus === 0;
    const title = '考务详情';
    const breadcrumb = ['考务管理', '考务列表', title];
    const headerOperation = <PageHeaderOperation buttons={[{ key: 'rollback' }]} />;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation} />
    );
    const gradeIndexs = Enums(GradeIndexEnum)
    const gradeName = getNameByValue(gradeIndexs, examDetail.gradeIndex)
    let roomStudent = '-'
    if (examDetail.roomColumnTotal && examDetail.roomRowTotal) {
      roomStudent = (examDetail.roomColumnTotal * examDetail.roomRowTotal).toString()
    }
    // 高一、610人、21个教师，每个教室30人
    const titleTip = `${gradeName}、${examDetail.studentNum || '-'}人、${examDetail.roomNum || '-'}个教室，每个教室${roomStudent}人`

    return (
      <Page
        header={header}>
        <div className={styles['container']}>
          <div className={styles['exam-title']}>{examName}</div>
          <div className={styles['exam-title-tip']}>{titleTip}</div>
          <div className={styles['opetate-top-container']}>
            <Search
              className={styles['search']}
              placeholder="请输入教师姓名"
              enterButton="搜索"
              size="default"
              onSearch={value => { this.onSearch(value) }}
            />
            {/* <Button className={styles['button']} type='primary' onClick={this.edit}>编辑</Button> */}
            <Button className={styles['button']} type='primary' onClick={this.importTable}>导出</Button>
          </div>
          <div className={styles['exam-table-container']}>
            <ExamTable examDetail={examDetail} examinationId={query.id}
              canEdit={canEdit} searchValue={this.state.value} />
          </div>

          <div className={styles['exam-title']}>教师监考场次统计</div>
          {/* <div className={styles['opetate-top-container']}>
            <Button className={styles['button']} type='primary' onClick={this.importTeacherTable}>导出</Button>
          </div> */}
          <div className={styles['exam-table-container']}>
            <TeacherTable examDetail={examDetail} />
          </div>
          <div className={styles['bottom']}></div>
        </div>
      </Page>
    )
  }
}