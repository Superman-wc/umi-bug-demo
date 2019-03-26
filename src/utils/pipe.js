export function pipe(...fns) {
  return (...args) =>
    fns.reduce(
      (promise, fn) => promise.then(a => Array.isArray(a) ? fn(...a) : fn(a)),
      Promise.resolve(args)
    );
}

export function pipes(...fns) {
  return (...arr) => {
    const ret = [];
    const push = ret.push.bind(ret);
    let i = 0;
    const len = arr.length;

    function run() {
      return pipe(...fns, push, () => {
        i++;
        return i < len ? run() : Promise.resolve(ret);
      })(arr[i], i);
    }

    return len ? run() : Promise.resolve(ret);
  };
}


/**
 * 流水线任务编排
 * 1->2->3->4
 *    1->2->3->4
 *       1->2->3->4
 * @param steps   任务步骤集合
 * @param tasks   任务单元集合
 * @returns {Promise<T | never>}
 */
export function flowLine(steps, tasks) {

  const tlen = tasks.length;
  const slen = steps.length;
  const cols = tlen + slen - 1;

  const ps = new Array(tlen * cols);
  ps.fill(Promise.resolve());

  tasks.forEach((task, ti) => {
    steps.forEach((step, si) => {
      const index = ti * cols + ti + si;
      const left = index - 1;
      const leftTop = left - cols;
      const leftPromise = ps[left] || Promise.resolve();
      const leftTopPromise = ps[leftTop] || Promise.resolve();
      ps[index] = Promise.all([
        leftPromise,
        leftTopPromise
      ]).then(
        ([l]) => l ? Promise.reject(l) : step(task)
      ).then(
        () => null,
        ex => ex
      );
      // 测试时输出
      // ps[index].task = {task:task.id, si, ti, index};
      // ps[index].left = leftPromise.task;
      // ps[index].leftTop = leftTopPromise.task;
    })
  });

  // 测试时输出
  // console.log(ps);

  return Promise.all(ps).then(() => tasks);
}



// 测试flowLine
// flowLine([
//   task=>delay(random(1000)).then(()=>console.log('第一次任务：', task)).then(()=>task.random = random(1000)).then(()=>error(task, '第一个任务')).catch(ex=>{task.err ? task.err.push(ex): (task.err=[ex])}),
//   task=>delay(random(2000)).then(()=>console.log('第二次任务：', task)).then(()=>task.random = random(2000)).then(()=>error(task, '第二个任务')).catch(ex=>{task.err ? task.err.push(ex): (task.err=[ex])}),
//   task=>delay(random(1500)).then(()=>console.log('第三次任务：', task)).then(()=>task.random = random(3000)).then(()=>error(task, '第三个任务')).catch(ex=>{task.err ? task.err.push(ex): (task.err=[ex])}),
// ], [
//   {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}
// ]).then(res=>console.log('完成：', res));
//
// function random(max) {
//   return Math.floor(Math.random() * max);
// }
//
// function delay(time) {
//   return new Promise(resolve => setTimeout(resolve, time));
// }
//
// function error(it, msg){
//   if(random(1000)%4===0){
//     throw new Error(it.id+'发生随机错误:'+msg);
//   }
// }

