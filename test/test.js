const Promise = require('../index.js')
// const promisesAplusTests = requre('promises-aplus-tests')

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2333)
  }, 1000)
}).then((res) => {
  console.log(res, res++)
  return res
}).then((res) => {
  console.log(res, res++)
})