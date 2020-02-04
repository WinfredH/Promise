class Promise {
  constructor (callback) {
    this.state = 'pending'
    this.value = undefined
    this.reason = undefined
    this.fulfilledCallbacks = []
    this.rejectCallbacks = []  

    try {
      if (typeof callback === 'function') {
        callback(this.resolve.bind(this), this.reject.bind(this))
      }
    } catch {
      this.reject()
    }
  }

  then (onFulfilled, onRejected) {
    // 返回新的Promise实例，实现链式调用
    return new Promise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        const res = onFulfilled(this.value)
        resolvePromise(aNewPromise, res, resolve, reject)
      }

      if (this.state === 'rejected') {
        const res = onRejected(this.reason)
        resolvePromise(aNewPromise, res, resolve, reject)
      }

      if (this.state === 'pending') {
        // pending状态下订阅resolve/reject
        this.fulfilledCallbacks.push(() => {
          const res = onFulfilled(this.value)
          resolvePromise(aNewPromise, res, resolve, reject)
        })
        this.rejectCallbacks.push(() => {
          const res = onRejected(this.reason)
          resolvePromise(aNewPromise, res, resolve, reject)
        })
      }
    })
  }

  resolve (value) {
    if (this.state === 'pending') {
      this.state = 'fulfilled'
      this.value = value
      this.fulfilledCallbacks.forEach((callback) => { callback() })
    }
  }

  reject (reason) {
    if (this.state === 'pending') {
      this.state = 'rejected'
      this.reason = reason
      this.rejectCallbacks.forEach((callback) => { callback() }) 
    }
  }
}

function resolvePromise (aNewPromise, res, resolve, reject) {
  // 循环引用报错
  if (aNewPromise === res) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }

  // 防止多次调用
  let called;
  // res不是null 且res是对象或者函数
  if (res != null && (typeof res === 'object' || typeof res === 'function')) {
    try {
      // A+规定，声明then = res的then方法
      let then = res.then;
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') {
        // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
        then.call(res, (value) => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // resolve的结果依旧是promise 那就继续解析
          resolvePromise(aNewPromise, value, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(res); // 直接成功即可
      }
    } catch (e) {
      // 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e);
    }
  } else {
    resolve(res);
  }
}

Promise.resolve = function (value) {
  return new Promise((resolve) => { resolve(value) })
}

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => { reject(reason) })
}

Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

module.exports = Promise
