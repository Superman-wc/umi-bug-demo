import request from '../../utils/request';

/**
 * 数据总览-场地资源
 * @param buildingType 类型 1-教学区 2-生活区
 * @returns {Promise<*>}
 */
export async function building({buildingType = 1} = {}) {
  return request('/api/8queen/statistic/building', {data: {buildingType}, method: 'GET'});
}

/**
 * 数据总览-选考数据
 * @param gradeIndex2  类型 10-高一 11-高二 12-高三
 * @returns {Promise<*>}
 */
export async function electionExamination({gradeIndex2 = 10} = {}) {
  return request('/api/8queen/statistic/electionExamination', {data: {gradeIndex: gradeIndex2}, method: 'GET'});
}

/**
 * 数据总览-学校学期
 * @returns {Promise<*>}
 */
export async function semester() {
  return request('/api/8queen/statistic/semester', {method: 'GET'});
}

/**
 * 数据总览-学生数据
 * @param gradeIndex 类型 10-高一 11-高二 12-高三
 * @returns {Promise<*>}
 */
export async function student({gradeIndex = 10} = {}) {
  return request('/api/8queen/statistic/student', {data: {gradeIndex}, method: 'GET'});
}

/**
 * 数据总览-教师数据
 * @returns {Promise<*>}
 */
export async function teacher() {
  return request('/api/8queen/statistic/teacher', {method: 'GET'});
}

/**
 * 数据总览-教学计划
 * @returns {Promise<*>}
 */
export async function timetable() {
  return request('/api/8queen/statistic/timeTable', {method: 'GET'});
}

/**
 * 数据总览-当前分班排课方案
 * @param gradeIndex3      类型 10-高一 11-高二 12-高三
 * @returns {Promise<*>}
 */
export async function activatedPlan({gradeIndex3 = 10}) {
  return request('/api/8queen/statistic/activatedPlan', {data: {gradeIndex: gradeIndex3}, method: 'GET'});
}
