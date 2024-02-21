export const ipcManDataTypeMap = {
  event: {
    name: 'EVT',
  },
  request: {
    name: 'REQ',
  },
  'handle-request': {
    name: 'HRQ',
  },
  'handle-response': {
    name: 'HRS',
  },
  'wrapped-request': {
    name: 'WRQ',
  },
  'wrapped-response': {
    name: 'WRS',
  },
} as const
