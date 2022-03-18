import {$} from 'zx'

const tidbEndpoint = "127.0.0.1"
const tidbPort = "4000"
const tidbUser = "root"
const tidbPassword = "pingcap!@#"

const database = "test"
const warehouses = 1
const thread = 4

export const benchPrepare = () => {
    let benchPrepare = $`sleep 5`

    return benchPrepare
}

export const benchRun = () => {
    let benchRun = $`sleep 20`

    return benchRun
}

export const benchCleanup = () => {
    let benchCleanup = $`sleep 5`

    return benchCleanup
}
