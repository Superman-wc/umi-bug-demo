import request from '../../utils/request';

/**
 * 一学期所有考勤时间
 *
 * @param semesterId
 * @param gradeId
 * @param year  年份：2019
 * @param month  月份：1  传null返回本学期全部
 * @returns {Promise<*>}
 */
export async function list({semesterId, gradeId, year, month}) {
  return request(`/api/hii/1.0/admin/school/attendanceStandard?semesterId=${semesterId}&gradeId=${gradeId}&year=${year}&month=${month}`,
    {method: 'GET'});
}

/**
 * 修改单个日期考勤时间
 *
 * @param id  日期id
 * @param bedRoomStartTime
 * @param bedRoomEndTime
 * @param noResidentLeaveSchoolBackTime
 * @param noResidentLeaveSchoolOutTime
 * @returns {Promise<*>}
 */
export async function modify({id, bedRoomStartTime, bedRoomEndTime, noResidentLeaveSchoolBackTime, noResidentLeaveSchoolOutTime}) {
  return request('/api/hii/1.0/admin/school/attendanceStandard/' + id,
    {
      data: {
        bedRoomStartTime,
        bedRoomEndTime,
        noResidentLeaveSchoolBackTime,
        noResidentLeaveSchoolOutTime,
      },
      method: 'PUT'
    });
}

/**
 * 新增考勤日期
 *
 * @param semesterId 学期id
 * @param gradeId  年级id
 * @param singleAdd  1-单个日期
 * @param date  单个日期：2019-04-06
 * @param bedRoomStartTime  回寝时间：2019-03-10 12:10：00
 * @param bedRoomEndTime  就寝时间：2019-03-10 12:10：00
 * @param noResidentLeaveSchoolBackTime  到校时间：2019-03-10 12:10：00
 * @param noResidentLeaveSchoolOutTime  离校时间：2019-03-10 12:10：00
 * @returns {Promise<*>}
 */
export async function create({semesterId, gradeId, singleAdd, date, bedRoomStartTime, bedRoomEndTime, noResidentLeaveSchoolBackTime, noResidentLeaveSchoolOutTime}) {
  return request('/api/hii/1.0/admin/school/attendanceStandard',
    {
      data: {
        semesterId,
        gradeId,
        singleAdd,
        date,
        bedRoomStartTime,
        bedRoomEndTime,
        noResidentLeaveSchoolBackTime,
        noResidentLeaveSchoolOutTime,
      },
      method: 'POST'
    });
}
