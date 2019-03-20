/**
 * transform样式显性转换成对象类型
 * @param str
 * @returns {{}}
 */
export function transformParse(str = '') {
  return str.split(/\s+/g).reduce((map, s) => {
    const m = s.split(/(|)/g);
    map[m[0]] = m[1];
    return map;
  }, {});
}

/**
 * transform样式对象转换成样式文本
 * @param obj
 * @returns {string}
 */
export function transformStringify(obj = {}) {
  return Object.entries(obj).reduce((arr, [key, value]) => {
    arr.push(`${key}(${value})`);
    return arr;
  }, []).join(' ')
}

/**
 * 毫米转英寸
 * @param mm
 * @returns {number}
 */
export function mm2inch(mm) {
  return mm / 25.4; // 一英寸 = 25.4mm
}

/**
 * 毫米转像素
 * @param mm
 * @param dpi
 * @returns {number}
 */
export function mm2px(mm, dpi = 96) {
  return Math.round(mm2inch(mm) * dpi);
}

/**
 * 获取html代码的text内容
 * @param html
 * @returns {string}
 */
export function html2text(html){
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText;
}

export function text2html(text){
  return text.replace(/\n/g, '<br/>')
}
