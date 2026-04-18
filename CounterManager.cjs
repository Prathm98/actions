const fs = require('fs')
const path = require('path')

const FILE_PATH = path.join(__dirname, 'counter.json')

class CounterManager {
  constructor(filePath = FILE_PATH) {
    this.filePath = filePath
    this.data = this._load()
  }

  _load() {
    if (fs.existsSync(this.filePath)) {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
    }
    // Default structure if file doesn't exist
    return {
      counter: 0,
    }
  }

  _save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8')
  }

  // ✅ Get current values
  getCurrent() {
    return this.data
  }

  // ✅ Get next values (just +1 each, preview only)
  getNext() {
    return {
      counter: this.data.counter + 1,
    }
  }

  // ✅ Update counter
  updateCurrent(value) {
    this.data.counter = value
    this._save()
  }
}

module.exports = CounterManager
