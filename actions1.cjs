const run = require('./actions.cjs')
const path = require('path')

const TOTAL_SERIES = 2

async function run1() {
  for (let index = 1; index <= TOTAL_SERIES; index++) {
    const FILE_PATH = path.join(__dirname, `progress${index}.json`)
    await run(FILE_PATH, `${index}`)
  }
}

module.exports = run1

// run()
