import { Table, Modal } from 'antd';
import React from 'react';
import StudentTable from './StudentTable';

export default class StudentTableModal extends React.Component {

  // onOk={() => {

  //   onOk && onOk();
  // }}
  render() {
    const { title, visible, placeId, onCancel } = this.props;
    return (
      <Modal
        width={1000}
        title={title}
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        <StudentTable placeId={placeId} />
      </Modal>
    )
  }
}