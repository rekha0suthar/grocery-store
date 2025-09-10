/* eslint-disable no-unused-vars */
export class IClock {
  now() {
    throw new Error('IClock.now() must be implemented');
  }

  timestamp() {
    throw new Error('IClock.timestamp() must be implemented');
  }

  createDate(_value) {
    throw new Error('IClock.createDate() must be implemented');
  }

  addTime(_date, _milliseconds) {
    throw new Error('IClock.addTime() must be implemented');
  }

  isBefore(_date1, _date2) {
    throw new Error('IClock.isBefore() must be implemented');
  }

  isAfter(_date1, _date2) {
    throw new Error('IClock.isAfter() must be implemented');
  }
}
