import React from 'react';

export default function WeekIndex({value}) {
  const [, year, week] = value.toString().match(/(^\d{4})(\d{1,2}$)/);
  return (
    <span><span>{year}年</span><span>第{week}周</span></span>
  )
}
