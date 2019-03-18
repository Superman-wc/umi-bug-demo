import { Table, Modal, Button } from 'antd';
import React from 'react';
import TeacherSelectTable from './TeacherSelectTable';
import styles from './exam.less'

export default class TeacherSelectTableModal extends React.Component {

  render() {
    const { title, visible, monitorNum, examinationId, examinationSubjectId, examinationPlaceId,
      onOk, onClear, onCancel, handleClickName, handleMultiClick } = this.props;
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
    };

    let footer = null;
    if (monitorNum === 1) {
      footer = <div>
        <Button onClick={onCancel}>取消</Button>
        <Button type='primary' onClick={onClear}>清空监考</Button>
      </div>
    } else {
      footer = <div>
        <Button onClick={onCancel}>取消</Button>
        <Button type='primary' onClick={onClear}>清空监考</Button>
        <Button type='primary' onClick={onOk}>确定</Button>
      </div>
    }

    return (
      <Modal
        width={1100}
        title={title}
        visible={visible}
        footer={footer}
        onCancel={onCancel}
      >
        <div className={styles['teacherTitle']}>建议选择{monitorNum}位监考老师</div>
        <div>
          {node}
        </div>
      </Modal>
    )
  }
}