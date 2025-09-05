const fs = require('fs')
const path = require('path')

const FILE_PATH = path.join(__dirname, 'progress.json')

// Verse counts per chapter (Bhagavad Gita)
const VERSES_PER_CHAPTER = [
  47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78,
]

class ProgressManager {
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
      currentInsta: 0,
      currentYt: 0,
      currentFB: 0,
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
      currentInsta: this.data.currentInsta + 1,
      currentYt: this.data.currentYt + 1,
      currentFB: this.data.currentFB + 1,
    }
  }

  // ✅ Update Insta counter
  updateCurrentInsta(value) {
    this.data.currentInsta = value
    this._save()
  }

  // ✅ Update YT counter
  updateCurrentYt(value) {
    this.data.currentYt = value
    this._save()
  }

  // ✅ Update FB counter
  updateCurrentFB(value) {
    this.data.currentFB = value
    this._save()
  }

  // ✅ Convert verse number → chapter & verse
  getChapterAndVerse(globalNumber) {
    let remaining = globalNumber
    for (let ch = 0; ch < VERSES_PER_CHAPTER.length; ch++) {
      if (remaining <= VERSES_PER_CHAPTER[ch]) {
        return { ch: ch + 1, verse: remaining }
      }
      remaining -= VERSES_PER_CHAPTER[ch]
    }
    return null // if number > 700
  }
}

module.exports = ProgressManager

// const pm = new ProgressManager()

// // Get current values
// console.log('Current:', pm.getCurrent())

// // Update Insta and YT
// pm.updateCurrentInsta(48)
// pm.updateCurrentYt(47)
// pm.updateCurrentFB(120)

// // Convert global number to chapter & verse
// const instaPos = pm.getChapterAndVerse(pm.getCurrent().currentInsta)
// const ytPos = pm.getChapterAndVerse(pm.getCurrent().currentYt)
// const fbPos = pm.getChapterAndVerse(pm.getCurrent().currentFB)

// console.log('Insta position:', instaPos)
// console.log('YouTube position:', ytPos)
// console.log('FaceBook position:', fbPos)
