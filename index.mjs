import {$, fs, quiet} from 'zx'
import pino from 'pino'
import 'process'
import 'fs'
import YAML from 'yaml'

import {benchCleanup, benchPrepare, benchRun} from './bench.mjs'
import moment from 'moment'

const beforeInjectionSeconds = 60*5

const injectionDurationSeconds = 60*10
const injectionIntervalSeconds = 60*10

const chaosInspectInterval = 1000 * 30
const tidbNamespace = "tidb1369682775200136354"

let allChaos = fs.readdirSync("./chaos").map(item => item.slice(0, -5))

const getChaosNamespacedName = async (chaosName) => {
    const file = await fs.readFile(`./chaos/${chaosName}.yaml`, {encoding: 'utf8'})
    const chaos = YAML.parse(file)

    return {
        namespace: chaos.metadata.namespace,
        name: chaos.metadata.name,
        kind: chaos.kind,
    }
}

const restartTikvCluster = async () => {
    const time = new Date()
    const patch = $`kubectl patch tc -n ${tidbNamespace} db --type='json' -p='[{"op": "replace", "path": "/spec/tikv/annotations/annotations", "value":"${moment(time).format('YYYY-MM-DDTHH:mm')}"}]'`

    await patch
}

let logger = pino()
let prepareStep = benchPrepare()
await prepareStep
logger.info('prepare finished')

logger.info('start running benchmark')
benchRun()

logger.info(`waiting ${beforeInjectionSeconds} seconds before injection`)
await $`sleep ${beforeInjectionSeconds}`

while (true) {
    let logger = pino()

    logger.info('starting a new loop')

    logger.info('select chaos')
    const choosenChaos = allChaos[Math.floor(Math.random() * allChaos.length)]
    const {namespace, name, kind} = await getChaosNamespacedName(choosenChaos)
    logger = logger.child({chaos: choosenChaos, namespace, name, kind})


    logger.info('injecting chaos')
    await $`kubectl apply -f ./chaos/${choosenChaos}.yaml`
    const chaosPrintInterval = setInterval(async () => {
        const kubectlInfo = await quiet($`kubectl get ${kind} ${name} -n ${namespace} -o json`)
        // this line compact the json
        const output = JSON.stringify(JSON.parse(kubectlInfo.stdout))
        logger.info(`chaos info: ${output}`)
    }, chaosInspectInterval)

    await $`sleep ${injectionDurationSeconds}`

    logger.info('printing chaos info')
    const kubectlInfo = await quiet($`kubectl get ${kind} ${name} -n ${namespace} -o json`)
    // this line compact the json
    const chaosOutput = JSON.stringify(JSON.parse(kubectlInfo.stdout))
    logger.info(`chaos info: ${chaosOutput}`)

    logger.info('recovering chaos')
    await $`kubectl delete -f ./chaos/${choosenChaos}.yaml`
    clearInterval(chaosPrintInterval)
    logger.info('chaos recovered')

    await $`sleep ${injectionIntervalSeconds}`
    logger.info("loop finished")
}
