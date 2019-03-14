import { Table, Modal } from 'antd';
import React from 'react';
import TeacherSelectTable from './TeacherSelectTable';
import styles from './exam.less'

export default class TeacherSelectTableModal extends React.Component {

  render() {
    const { title, visible, monitorNum, examinationId, examinationSubjectId, examinationPlaceId,
      onOk, onCancel, handleClickName, handleMultiClick } = this.props;
    let cancelText = '清空监考';
    // if (monitorNum === 1) {
    //   cancelText = '取消'
    // }
    let node = <div></div>
    if (visible) {
      node = <TeacherSelectTable
        handleClickName={handleClickName}
        handleMultiClick={handleMultiClick}
        monitorNum={monitorNum}
        examinationId={examinationId}
        examinationSubjectId={examinationSubjectId}
        examinationPlaceId={examinationPlaceId}
        onOk={() => {
          onOk && onOk();
        }}
      />
    }
    return (
      <Modal
        width={1000}
        title={title}
        visible={visible}
        cancelText={cancelText}
        onCancel={onCancel}
        onOk={() => {
          if (monitorNum === 1) {
            onCancel && onCancel();
          } else {
            onOk && onOk();
          }
        }}
      >
        <div className={styles['teacherTitle']}>建议选择{monitorNum}位监考老师</div>
        <div>
          {node}
        </div>
      </Modal>
    )
  }
}