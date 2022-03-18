import {$, nothrow} from 'zx'

const tidbEndpoint = process.env["HOST"] || "127.0.0.1"
const tidbPort = process.env["PORT"] || "4000"
const tidbUser = process.env["USER"] ||  "root"
const tidbPassword = process.env["PASSWORD"] || "pingcap!@#"

const database = process.env["DATABASE"] || "test"
const warehouses = parseInt(process.env["WAREHOUSE"]) || 1
const thread = parseInt(process.env["THREAD"]) || 4

const tpccBenchOutputInterval = "1m"

export const benchPrepare = () => {
    let benchPrepare = nothrow($`tiup bench tpcc -H ${tidbEndpoint} -P ${tidbPort} -D ${database} --warehouses ${warehouses} prepare -T ${thread} --user ${tidbUser} --password ${tidbPassword}`)

    return benchPrepare
}

export const benchRun = () => {
    return (async () => {
        while(true) {
            await nothrow($`tiup bench tpcc --interval ${tpccBenchOutputInterval} -H ${tidbEndpoint} -P ${tidbPort} -D ${database} --warehouses ${warehouses} run -T ${thread} --user ${tidbUser} --password ${tidbPassword}`)
        }
    })()
}

export const benchCleanup = () => {
    let benchCleanup = nothrow($`tiup bench tpcc -H ${tidbEndpoint} -P ${tidbPort} -D ${database} --warehouses ${warehouses} cleanup --user ${tidbUser} --password ${tidbPassword}`)

    return benchCleanup
}
