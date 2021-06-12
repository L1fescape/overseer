import * as dayjs from 'dayjs'
import * as relativeTime from 'dayjs/plugin/relativeTime'

import { Report } from './db'

dayjs.extend(relativeTime)

export function reportsToString(reports: Report[]): string {
  reports.sort((a, b) => b.date - a.date)
  return reports.reduce((acc, report) => {
    return `${acc}- ${dayjs(report.date).fromNow()} by ${report.reporter}\n`
  }, "")
}

export function reportCountToString(reports: Report[]): string {
  return `${reports.length} time${reports.length === 1 ? '' : 's'}`
}
