export type FormParam =
  'accountFrom' |
  'accountTo' |
  'recipientName' |
  'recipientIin' |
  'recipientIban' |
  'recipientPhone' |
  'transferSum'

export type FormParams = {
  [key in FormParam]?: string
}
