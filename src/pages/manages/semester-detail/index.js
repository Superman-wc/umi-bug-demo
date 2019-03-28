import React, {Component} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Form, Radio, Menu, Button, Icon, Calendar, Badge, Modal, TimePicker, notification} from 'antd';
import {ManagesSemesterDetail} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './index.less';

const checkIcon = <Icon type={"check"}/>;
const closeIcon = <Icon type={"close"}/>;
@connect(state => ({
  list: state[ManagesSemesterDetail].list,
  loading: state[ManagesSemesterDetail].loading,
}))
export default class SemsterDetail extends Component {

  state = {
    currentKey: '1',
    editState: false,
    editModalVisible: false,
    currentSelectDate: moment(),
    currentSelectItem: null,
    updateSelectItem: null
  };

  // 编辑-保存 状态切换
  onEditStateChange = () => {
    const {list} = this.props;
    if (list && list.length) {
      this.setState({
        editState: !this.state.editState,
      });
    } else {
      notification.error({message: '不可修改'});
    }
  };

  // 年级选择
  onMenuSelect = (e) => {
    // console.log('onMenuSelect: ', e);
    const {dispatch, location: {query: {id, year}}} = this.props;
    dispatch({
      type: ManagesSemesterDetail + '/list',
      payload: {
        semesterId: id,
        gradeId: e.key,
        year: year,
        month: null
      }
    });
  };

  // 宿舍考勤时间
  onBedTimeSelectChange = (value) => {
    const {type, startTime, endTime} = value;
    let bedValue;
    if (type === 0) {
      bedValue = {
        bedRoomStartTime: null,
        bedRoomEndTime: null
      };
    } else {
      bedValue = {
        bedRoomStartTime: startTime,
        bedRoomEndTime: endTime
      };
    }
    this.state.updateSelectItem = Object.assign({}, this.state.updateSelectItem, bedValue);
  };

  // 到离校考勤时间
  onBedSchoolSelectChange = (value) => {
    const {type, startTime, endTime} = value;
    let schoolValue;
    if (type === 0) {
      schoolValue = {
        noResidentLeaveSchoolBackTime: null,
        noResidentLeaveSchoolOutTime: null
      };
    } else {
      schoolValue = {
        noResidentLeaveSchoolBackTime: startTime,
        noResidentLeaveSchoolOutTime: endTime
      };
    }
    this.state.updateSelectItem = Object.assign({}, this.state.updateSelectItem, schoolValue);
  };

  // 确定
  handleSelectItem = () => {
    const {currentSelectDate, currentSelectItem, updateSelectItem, currentKey} = this.state;
    const {dispatch, location: {query: {id}}} = this.props;
    // console.log('currentSelectDate-currentSelectItem-updateSelectItem:',
    //   currentSelectDate, currentSelectItem, updateSelectItem);

    const bedRoomStartTime = updateSelectItem.bedRoomStartTime ?
      updateSelectItem.bedRoomStartTime.format('YYYY-MM-DD HH:mm:ss') : null;

    const bedRoomEndTime = updateSelectItem.bedRoomEndTime ?
      updateSelectItem.bedRoomEndTime.format('YYYY-MM-DD HH:mm:ss') : null;

    const noResidentLeaveSchoolBackTime = updateSelectItem.noResidentLeaveSchoolBackTime ?
      updateSelectItem.noResidentLeaveSchoolBackTime.format('YYYY-MM-DD HH:mm:ss') : null;

    const noResidentLeaveSchoolOutTime = updateSelectItem.noResidentLeaveSchoolOutTime ?
      updateSelectItem.noResidentLeaveSchoolOutTime.format('YYYY-MM-DD HH:mm:ss') : null;

    const date = currentSelectDate.format('YYYY-MM-DD HH:mm:ss');

    console.log('params: ',
      date,
      bedRoomStartTime,
      bedRoomEndTime,
      noResidentLeaveSchoolBackTime,
      noResidentLeaveSchoolOutTime);

    if (currentSelectItem && currentSelectItem.id) {// 修改
      dispatch({
        type: ManagesSemesterDetail + '/modify',
        payload: {
          id: currentSelectItem.id,
          bedRoomStartTime,
          bedRoomEndTime,
          noResidentLeaveSchoolBackTime,
          noResidentLeaveSchoolOutTime,
        },
        resolve: this.getTimeList
      });
    } else {// 新增
      dispatch({
        type: ManagesSemesterDetail + '/create',
        payload: {
          semesterId: id,
          gradeId: currentKey,
          singleAdd: 1,
          date,
          bedRoomStartTime,
          bedRoomEndTime,
          noResidentLeaveSchoolBackTime,
          noResidentLeaveSchoolOutTime,
        },
        resolve: this.getTimeList
      });
    }
  };

  getTimeList = () => {
    notification.success({message: '修改成功'});
    this.setState({editModalVisible: false});
    const {dispatch, location: {query: {id, year}}} = this.props;
    const {currentKey} = this.state;
    dispatch({
      type: ManagesSemesterDetail + '/list',
      payload: {
        semesterId: id,
        gradeId: currentKey,
        year,
        month: null
      },
    })
  };

  // 单个日期修改
  onCellEdit = (date, currentItem) => {
    // console.log('onCellEdit', currentItem);
    let updateSelectItem = null;
    if (currentItem && currentItem.id) {
      updateSelectItem = {
        bedRoomStartTime: currentItem.bedRoomStartTime ? moment(currentItem.bedRoomStartTime) : null,
        bedRoomEndTime: currentItem.bedRoomStartTime ? moment(currentItem.bedRoomEndTime) : null,
        noResidentLeaveSchoolBackTime: currentItem.bedRoomStartTime ? moment(currentItem.noResidentLeaveSchoolBackTime) : null,
        noResidentLeaveSchoolOutTime: currentItem.bedRoomStartTime ? moment(currentItem.noResidentLeaveSchoolOutTime) : null,
      };
    } else {
      updateSelectItem = {
        bedRoomStartTime: null,
        bedRoomEndTime: null,
        noResidentLeaveSchoolBackTime: null,
        noResidentLeaveSchoolOutTime: null,
      }
    }
    this.setState({
      editModalVisible: true,
      currentSelectDate: date,
      currentSelectItem: currentItem,
      updateSelectItem
    });
  };

  dateFullCellRender = (nowMoment, date) => {
    const {list = []} = this.props;
    const currentItem = list.find(it => {
      if (moment(it.date).startOf('day').valueOf() === date.startOf('day').valueOf()) {
        return it;
      }
    });
    const {editState} = this.state;
    const nowDay = nowMoment.startOf('day');
    let cellDateStyle;
    if (date < nowDay) {
      cellDateStyle = styles["cell-date-gray-white"];
    } else if (date.startOf('day').valueOf() === nowDay.valueOf()) {
      cellDateStyle = styles["cell-date-white-orange"];
    } else if (date > nowDay && (date.day() === 6 || date.day() === 0)) {
      cellDateStyle = styles["cell-date-black-pink"];
    } else {
      cellDateStyle = styles["cell-date-black-white"];
    }
    let oneBadge, twoBadge, threeBadge, fourBadge, fiveBadge;
    let bedIcon, schoolIcon;
    let oneText, twoText, threeText;
    if (currentItem) {
      oneText = currentItem.noResidentLeaveSchoolBackTime ?
        moment(currentItem.noResidentLeaveSchoolBackTime).format('HH:mm') : '-';
      twoText = currentItem.noResidentLeaveSchoolOutTime ?
        moment(currentItem.noResidentLeaveSchoolOutTime).format('HH:mm') : '-';
      if (currentItem.bedRoomStartTime && currentItem.bedRoomEndTime) {
        threeText = `${moment(currentItem.bedRoomStartTime).format('HH:mm')}-${moment(currentItem.bedRoomEndTime).format('HH:mm')}`;
      } else {
        threeText = '-';
      }
      if (date < nowDay) {
        oneBadge = 'default';
        twoBadge = 'default';
        threeBadge = 'default';
        fourBadge = 'default';
        fiveBadge = 'default';
        if (currentItem.bedRoomStartTime && currentItem.bedRoomEndTime) {
          bedIcon = checkIcon;
        } else {
          bedIcon = closeIcon;
        }
        if (currentItem.noResidentLeaveSchoolBackTime && currentItem.noResidentLeaveSchoolOutTime) {
          schoolIcon = checkIcon;
        } else {
          schoolIcon = closeIcon;
        }
      } else {
        oneBadge = 'default';
        twoBadge = 'processing';
        threeBadge = 'success';
        if (currentItem.bedRoomStartTime && currentItem.bedRoomEndTime) {
          fourBadge = 'error';
          bedIcon = checkIcon;
        } else {
          fourBadge = 'default';
          bedIcon = closeIcon;
        }
        if (currentItem.noResidentLeaveSchoolBackTime && currentItem.noResidentLeaveSchoolOutTime) {
          fiveBadge = 'error';
          schoolIcon = checkIcon;
        } else {
          fiveBadge = 'default';
          schoolIcon = closeIcon;
        }
      }
    }
    return (
      <div className={styles["cell-container"]}>
        <div className={styles["cell-height"]}>
          <div className={styles["cell-date-container"]}>
            <div className={cellDateStyle}>{date.date()}</div>
            {
              editState && date >= nowDay &&
              <Button
                htmlType={"button"}
                size={"small"}
                onClick={this.onCellEdit.bind(null, date, currentItem)}
                className={styles["cell-edit"]}>设置</Button>
            }
          </div>
          {
            currentItem &&
            <ul style={{marginRight: 8}}>
              <li><Badge status={oneBadge} text={oneText}/></li>
              <li><Badge status={twoBadge} text={twoText}/></li>
              <li><Badge status={threeBadge} text={threeText}/></li>
              <li><Badge style={{width: 80}} status={fourBadge} text={'宿舍考勤'}/>{bedIcon}</li>
              <li><Badge style={{width: 80}} status={fiveBadge} text={'到离校考勤'}/>{schoolIcon}</li>
            </ul>
          }
        </div>
      </div>
    );
  };

  render() {
    const {loading, list = [], location: {query: {academicYear, semesterType, startDate, endDate}}} = this.props;
    const {editState} = this.state;
    const nowMoment = moment();
    const editName = editState ? '保存' : '编辑';
    const state = this.state;
    const title = '教学日历';
    const breadcrumb = ['管理', '学期管理', title];
    const headerOperation = <PageHeaderOperation buttons={[{key: 'rollback'}]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );
    const menus = [
      {key: '1', title: '高一年级'},
      {key: '2', title: '高二年级'},
      {key: '3', title: '高三年级'},
    ];
    const menuItems = menus.map(it =>
      <Menu.Item key={it.key}>{it.title}</Menu.Item>
    );
    let gradeName = '';
    for (let menu of menus) {
      if (menu.key === state.currentKey) {
        gradeName = menu.title;
        break;
      }
    }
    const semesterName = semesterType === 1 ? '上学期' : '下学期';
    const teachCalendarName = `${academicYear}学年 ${semesterName} ${gradeName}教学日历`;
    const nowTime = nowMoment.format('YYYY-MM-DD dddd');
    const currentItem = list.find(it => {
      if (moment(it.date).startOf('day').valueOf() === nowMoment.startOf('day').valueOf()) {
        return it;
      }
    });
    let kaoTime = '今天无考勤';
    if (currentItem) {
      const schoolBack = currentItem.noResidentLeaveSchoolBackTime ?
        moment(currentItem.noResidentLeaveSchoolBackTime).format('HH:mm') : "-";
      const schoolOut = currentItem.noResidentLeaveSchoolOutTime ?
        moment(currentItem.noResidentLeaveSchoolOutTime).format('HH:mm') : "-";
      let bed;
      if (currentItem.bedRoomStartTime && currentItem.bedRoomEndTime) {
        bed = `${moment(currentItem.bedRoomStartTime).format('HH:mm')}-${moment(currentItem.bedRoomEndTime).format('HH:mm')}`;
      }
      kaoTime = `${schoolBack} ${schoolOut} ${bed}`;
    }

    let defaultDate;
    if (endDate && endDate < nowMoment.startOf('day').valueOf()) {
      defaultDate = moment(endDate);
    } else if (startDate && startDate > nowMoment.endOf('day').valueOf()) {
      defaultDate = moment(startDate)
    } else {
      defaultDate = nowMoment;
    }


    const menuProps = {
      style: {marginLeft: 40},
      selectedKeys: [state.currentKey],
      mode: 'horizontal',
      onSelect: this.onMenuSelect,
      onClick: (e) => {
        this.setState({currentKey: e.key})
      },
    };

    const editBtnProps = {
      type: "primary",
      style: {marginLeft: 20},
      onClick: this.onEditStateChange,
    };

    const calendarProps = {
      defaultValue: defaultDate,
      validRange: [moment(startDate), moment(endDate)],
      dateFullCellRender: this.dateFullCellRender.bind(null, nowMoment),
      // onSelect: this.onDateSelect,
      style: {marginTop: 30, marginLeft: 20, marginRight: 20},
      disabledDate: (current) => (current < nowMoment.startOf('day') ||
        current > moment(endDate).endOf('day')),
    };

    const editModalProps = {
      visible: state.editModalVisible,
      destroyOnClose: true,
      centered: true,
      title: `修改教学安排 (${gradeName}-${state.currentSelectDate.format('MM.DD')})`,
      onCancel: () => {
        this.setState({
          editModalVisible: false,
          updateSelectItem: null
        })
      },
      onOk: this.handleSelectItem,
    };

    const bedTimeSelectProps = {
      timeItem: {
        startTime: state.currentSelectItem ? state.currentSelectItem.bedRoomStartTime : null,
        endTime: state.currentSelectItem ? state.currentSelectItem.bedRoomEndTime : null
      },
      label: '宿舍考勤',
      onChange: this.onBedTimeSelectChange,
    };

    const schoolTimeSelectProps = {
      timeItem: {
        startTime: state.currentSelectItem ? state.currentSelectItem.noResidentLeaveSchoolBackTime : null,
        endTime: state.currentSelectItem ? state.currentSelectItem.noResidentLeaveSchoolOutTime : null
      },
      style: {marginTop: 20},
      label: '到离校考勤',
      onChange: this.onBedSchoolSelectChange
    };

    return (
      <Page loading={!!loading} header={header}>
        <Menu {...menuProps}>{menuItems}</Menu>
        <span className={styles["semester-title"]}>{teachCalendarName}</span>
        <span className={styles["semester-tip"]}>提示: 如果修改教学安排,建议提前一天</span>
        <span className={styles["semester-tip"]}>时间项说明: 依次为到校时间、离校时间、最早/最晚回寝时间</span>
        <div className={styles["opera-container"]}>
          {/*<Button type={"primary"}>快速配置</Button>*/}
          <Button {...editBtnProps}>{editName}</Button>
          <div className={styles["opera-right-container"]}>
            <span>{nowTime}</span>
            <span>时间：{kaoTime}</span>
            <span>考勤：宿舍考勤{checkIcon} 到离校考勤{checkIcon}</span>
          </div>
        </div>
        <Calendar {...calendarProps}/>
        <div>
          <div className={styles["bottom-empty"]}/>
        </div>
        <Modal {...editModalProps}>
          {
            state.editModalVisible &&
            <div>
              <TimeSelect {...bedTimeSelectProps}/>
              <TimeSelect {...schoolTimeSelectProps}/>
            </div>
          }
        </Modal>
      </Page>
    )
  }
}

class TimeSelect extends Component {

  constructor(props) {
    super(props);
    const {timeItem = {}} = props;
    let type = 0, timeVisible = false;
    if (timeItem.startTime && timeItem.endTime) {
      type = 1;
      timeVisible = true;
    }
    this.state = {
      openStart: false,
      openEnd: false,
      timeVisible: timeVisible,
      type: type,
      startTime: timeItem.startTime ? moment(timeItem.startTime) : null,
      endTime: timeItem.endTime ? moment(timeItem.endTime) : null,
    };
  }

  handleOpen = () => {
    this.setState({
      openStart: false,
      openEnd: true
    });
  };

  handleClose = () => {
    this.setState({
      openEnd: false
    })
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({
        openStart: open,
        openEnd: true
      });
    } else {
      this.setState({openStart: open});
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({openEnd: open});
  };

  onRadioChange = (e) => {
    const value = e.target.value;
    this.setState({
      type: value,
      timeVisible: value === 1,
    });
    this.triggerChange({type: value});
  };

  onTimeStartChange = (date, s) => {
    let value;
    if (!this.state.endTime) {
      value = {
        startTime: date,
        endTime: date
      };
    } else {
      value = {
        startTime: date
      }
    }
    this.setState(value);
    this.triggerChange(value);
  };

  onTimeEndChange = (date, s) => {
    let value;
    if (!this.state.startTime) {
      value = {
        startTime: date,
        endTime: date
      };
    } else {
      value = {
        endTime: date
      }
    }
    this.setState(value);
    this.triggerChange(value);
  };

  triggerChange = (changeValue) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changeValue));
    }
  };

  // 开始时间不能大于结束时间
  disabledHoursStart = () => {
    const endTime = this.state.endTime;
    if (endTime) {
      const endHour = moment(endTime).hours();
      const nums = [];
      for (let i = endHour + 1; i <= 23; i++) {
        nums.push(i);
      }
      return nums;
    }
    return null;
  };

  // 结束时间不能小于开始时间
  disabledHoursEnd = () => {
    const startTime = this.state.startTime;
    if (startTime) {
      const startHour = moment(startTime).hours();
      const nums = [];
      for (let i = startHour - 1; i >= 0; i--) {
        nums.push(i);
      }
      return nums;
    }
    return null;
  };

  // 开始时间和结束时间相同时, 开始分钟不能大于结束分钟
  disabledMinutesStart = (selectedHour) => {
    const {startTime, endTime} = this.state;
    if (startTime && endTime) {
      const startHour = moment(startTime).hours();
      const endHour = moment(endTime).hours();
      if (startHour === endHour && selectedHour === startHour) {
        const endMinute = moment(endTime).minutes();
        const nums = [];
        for (let i = endMinute + 1; i <= 59; i++) {
          nums.push(i);
        }
        return nums;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  // 开始时间和结束时间相同时, 结束分钟不能小于开始分钟
  disabledMinutesEnd = (selectedHour) => {
    const {startTime, endTime} = this.state;
    if (startTime && endTime) {
      const startHour = moment(startTime).hours();
      const endHour = moment(endTime).hours();
      if (startHour === endHour && selectedHour === startHour) {
        const startMinute = moment(startTime).minutes();
        const nums = [];
        for (let i = startMinute - 1; i >= 0; i--) {
          nums.push(i);
        }
        return nums;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  render() {
    const {label = ''} = this.props;
    const state = this.state;
    return (
      <div className={styles["time-select-container"]}>
        <span style={{width: 70}}>{label}:</span>
        <Radio.Group
          value={state.type}
          style={{marginLeft: 8}}
          onChange={this.onRadioChange}>
          <Radio value={0}>否</Radio>
          <Radio value={1}>是</Radio>
        </Radio.Group>
        {
          state.timeVisible &&
          <div>
            <TimePicker
              style={{marginLeft: 14}}
              value={state.startTime}
              onChange={this.onTimeStartChange}
              onOpenChange={this.handleStartOpenChange}
              disabledHours={this.disabledHoursStart}
              disabledMinutes={this.disabledMinutesStart}
              format={'HH:mm'}
              open={state.openStart}
              placeholder={'考勤开始时间'}
              addon={() => (
                <Button size="small" type="primary" onClick={this.handleOpen}>
                  确定
                </Button>
              )}
            />
            <TimePicker
              style={{marginLeft: 8}}
              value={state.endTime}
              onChange={this.onTimeEndChange}
              onOpenChange={this.handleEndOpenChange}
              disabledHours={this.disabledHoursEnd}
              disabledMinutes={this.disabledMinutesEnd}
              open={state.openEnd}
              placeholder={'考勤结束时间'}
              format={'HH:mm'}
              addon={() => (
                <Button size="small" type="primary" onClick={this.handleClose}>
                  确定
                </Button>
              )}
            />
          </div>
        }
      </div>
    )
  }
}
