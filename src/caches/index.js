import Storage from '../utils/storage';

export const localCache = new Storage('布谷科技', window.localStorage);
export const sessionCache = new Storage('布谷科技', window.sessionStorage);

export const MINUTES = 60000;
export const HOURS = 60 * MINUTES;
export const DAY = 24 * HOURS;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
