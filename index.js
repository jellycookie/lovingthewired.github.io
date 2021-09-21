

$ = document.querySelector.bind(document)

var web3 = new Web3(Web3.givenProvider)

let accounts = []
let privAccount








// CALL

callTx = new Function({
  methodName: 'Call',
  type: 'call',
  args: [
    { name: 'to', placeholder: 'to', type: 'address' },
    { name: 'function', placeholder: 'function / hash', type: 'function' },
    { name: 'data', placeholder: 'data', type: 'data' },
  ]
})

callTx.buildTransaction = async (args) => {
  // console.log('callTx build', args)
  return await buildTransaction(
    '',
    args.to,
    '',
    '',
    args.function,
    args.data,
    '',
  )
}



// SEND TRANSACTION

sendTx = new Function({
  methodName: 'Send Transaction',
  type: 'send',
  args: [
    { name: 'from', placeholder: 'from', type: 'person' },
    { name: 'to', placeholder: 'to', type: 'address' },
    { name: 'value', placeholder: 'value (eth)', type: 'ether' },
    { name: 'gasPrice', placeholder: 'gas (gwei)', type: 'gwei' },
    { name: 'function', placeholder: 'function / hash', type: 'function' },
    { name: 'data', placeholder: 'data', type: 'data' },
    { name: 'nonce', placeholder: 'nonce', type: 'int' },
  ]
})


sendTx.buildTransaction = async (args) => {
  console.log('args', args)
  return await buildTransaction(
    args.from,
    args.to,
    args.value,
    args.gasPrice,
    args.function,
    args.data,
    args.nonce,
  )
}
sendTx.onchange = async () => {
  sendTxCondBox.disable()
  try { await sendTx.buildTransactionWrapper() }
  catch { }
}

// SEND CONDITION

var checkInterval = 200
sendTxCondBox = new CheckBox({ label: 'when possible' })
sendTxCondBox.dots = 1
sendTxCondBox.disable = function () {
  this.selector.checked = false
  clearInterval(this.interval)
  this.setInfo('')
}.bind(sendTxCondBox)

sendTxIfPossible = function () {
  let watching = this.selector.checked
  if (watching) {
    this.sendLock = false
    this.interval = setInterval(async () => {
      let valid = true

      if (this.sendLock) return

      this.setInfo(watching ? 'watching' + '.'.repeat(this.dots++ % 3) : '')
      console.log('check')

      try { await sendTx.buildTransactionWrapper() }
      catch { valid = false }

      this.sendLock = true;

      if (valid) {
        beep();
        try { await sendTx.sendTransactionWrapper() } // can still be low level invalid
        catch { valid = false }
        this.sendLock = false
      }

      if (valid) {
        this.selector.checked = false
        this.setInfo('Transaction sent!')
        clearInterval(this.interval)
      }

    }, checkInterval);
  } else clearInterval(this.interval)
}
sendTxCondBox.onchange = sendTxIfPossible.bind(sendTxCondBox)



// MULTICALL


deployMultTx = new Function({
  methodName: 'deploy',
  type: 'send',
  enabled: true,
  args: [{ name: 'from', placeholder: 'from', type: 'person' }]
})
deployMultTx.buildTransaction = async (args) => {

  let key = web3.utils.soliditySha3(args.from, 'hahahaha').slice(2)
  let data = multicallDeployData + key

  return buildTransaction('', '', '', '', '', data, '')
}

let deployedToField = new ArgInputField({ name: 'to', placeholder: 'multicall deployed address', type: 'contract' })

withdrawTokenTx = new Function({
  methodName: 'Withdraw Token',
  type: 'send',
  args: [
    { name: 'from', placeholder: 'from', type: 'person' },
    { name: 'tokenAddr', placeholder: 'tokenAddr', type: 'erc721' },
    { name: 'tokenIds', placeholder: 'token Ids' },
  ]
})

withdrawTokenTx.buildTransaction = async (args) => {

  let multicallAddress = deployedToField.getValue()
  if (multicallAddress === '') throw 'Multicall not deployed.'

  let tokenAddr = web3.utils.toChecksumAddress(args.tokenAddr)
  let tokenIds = args.tokenIds.split(',')

  let data = web3.eth.abi.encodeFunctionCall({
    name: 'withdrawToken', type: 'function',
    inputs: [{ type: 'address', name: 'addr', payable: true, },
    { type: 'uint256[]', name: 'tokenIds' }]
  }, [tokenAddr, tokenIds])

  let tx = buildTransaction('', multicallAddress, '', '', '', data, '')

  return tx
}


multTx = new Function({
  methodName: 'BatchMint',
  type: 'send',
  args: [
    { name: 'from', placeholder: 'from', type: 'person' },
    { name: 'tokenAddr', placeholder: 'tokenAddr', type: 'erc721' },
    { name: 'mintPrice', placeholder: 'mintPrice (eth)', type: 'ether' },
    { name: 'gasPrice', placeholder: 'gas (gwei)', type: 'gwei' },
    { name: 'function', placeholder: 'mint function / hash', type: 'function' },
    { name: 'numCalls', placeholder: 'numCalls', type: 'string' },
  ]
})

multTx.buildTransaction = async (args) => { //XXX: not using nonce
  // console.log('build', args)
  let from = web3.utils.toChecksumAddress(args.from)

  // console.log('1')

  let to = deployedToField.getValue()
  if (to === '') throw 'Multicall not deployed.'
  to = web3.utils.toChecksumAddress(to)

  let tokenAddr = web3.utils.toChecksumAddress(args.tokenAddr)
  let mintFn = args.function
  let mintFnCallData = web3.eth.abi.encodeFunctionCall({ name: mintFn, type: 'function', inputs: [{ type: 'uint256', name: '' }] }, ['1'])

  let numCalls = args.numCalls
  let mintPrice = web3.utils.toWei(args.mintPrice, 'ether')
  let value = web3.utils.toHex(web3.utils.toBN(mintPrice).mul(web3.utils.toBN(numCalls)).toString())

  let mintPriceHex = web3.utils.toHex(mintPrice)

  let data = web3.eth.abi.encodeFunctionCall({
    name: 'multicall',
    type: 'function',
    payable: true,
    inputs: [
      { type: 'address', name: 'addr', payable: true, },
      { type: 'uint256', name: 'num' },
      { type: 'uint256', name: 'value' },
      { type: 'bytes', name: 'data' },
    ]
  }, [
    tokenAddr,
    numCalls,
    mintPriceHex,
    mintFnCallData,
  ])

  let tx = { from: from, to: to, value: value, data: data }

  let gasPrice = args.gasPrice
  if (gasPrice !== '') tx.gasPrice = web3.utils.numberToHex(web3.utils.toWei(gasPrice, 'gwei'))

  try { tx.gas = await eth_estimateGas(tx) }
  catch (e) { throw e.message }

  return tx
}



multTxCondBox = new CheckBox({ label: 'when possible' })
multTxCondBox.disable = function () {
  this.selector.checked = false
  clearInterval(this.interval)
  this.setInfo('')
}.bind(multTxCondBox)

multTxIfPossible = function () {  // XXX XXX XXX Redundant
  let watching = this.selector.checked
  this.setInfo(watching ? 'watching' + '.'.repeat(this.dots++ % (1000 / checkInterval)) : '')
  if (watching) {
    this.sendLock = false
    this.interval = setInterval(async () => {
      let valid = true
      console.log('check')
      try { await multTx.buildTransactionWrapper() }
      catch { valid = false }

      if (this.sendLock) return
      this.sendLock = true;

      if (valid) {
        beep();
        try { await multTx.sendTransactionWrapper() } // can still be low level invalid
        catch { valid = false }
        this.sendLock = false
      }

      if (valid) {
        this.selector.checked = false
        this.setInfo('Transaction sent!')
        clearInterval(this.interval)
      }

    }, checkInterval);
  } else clearInterval(this.interval)
}
multTxCondBox.onchange = multTxIfPossible.bind(multTxCondBox)





// LAYOUT


warningBanner = new Banner('warning')
warningBanner.onchange = async () => {
  warningBanner.setInfo(ethereum.chainId == 1 ? 'WARNING: CURENTLY ON MAINNET' : '')
  if (ethereum.chainId == 1)
    warningBanner.selector.style.display = ''
  else
    warningBanner.selector.style.display = 'none'
}

chainLabel = new Label('chainId')
chainLabel.onchange = async () => {
  chainLabel.setInfo(ethereum.chainId.slice(2))
}

accountLabel = new Label('account')
accountLabel.onchange = async () => {
  accountLabel.setInfo(accounts[0] + ' ' + await getAccountInfo(accounts[0]))
}

keyLabel = new Label('generated private key')
keyLabel.init = () => {
  privKey = web3.eth.accounts.create().privateKey
  keyLabel.setInfo(privKey)
}


keyField = new ArgInputField({ placeholder: 'private key account', type: 'key' })
keyField.onchange = () => {
  valid = true
  try { privAccount = web3.eth.accounts.privateKeyToAccount(keyField.getValue()) }  // in globals 
  catch (e) { valid = false }
  if (valid) {
    expertMode.group.style.display = ''
    // expertMode.setInfo(privAccount)
  }
  else {
    expertMode.enabled = false
    expertMode.selector.checked = false
    expertMode.group.style.display = 'none'
    expertMode.setInfo('')
  }
}

expertMode = new CheckBox({ label: 'expert mode' })
expertMode.onchange = function () {
  this.enabled = this.selector.checked
  if (this.enabled) this.setInfo('finalizing transactions WITHOUT CONFIRMATION!')
  else this.setInfo('')
}.bind(expertMode)



mainPanel = new Panel([
  // infoPanel,
  chainLabel,
  accountLabel,
  keyLabel,
  keyField,
  expertMode,
  new Panel([
    callTx,
    sendTx,
    new Panel([sendTxCondBox], "auto send under conditon")
  ]),
  new Panel([
    deployMultTx,
    deployedToField,
    withdrawTokenTx,
    multTx,
    new Panel([multTxCondBox], "auto send under conditon")
  ], "MultiCall")
])

container = new Panel([
  warningBanner,
  mainPanel,
], '', true)

document.body.innerHTML = container._render()
container._init()


expertMode.group.style.display = 'none'



async function reloadAccounts() {
  accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  accountLabel.onchange()
  warningBanner.onchange()
  chainLabel.onchange()
  container._update()
}
ethereum.on('chainChanged', reloadAccounts)
ethereum.on('accountsChanged', reloadAccounts)
window.addEventListener('load', reloadAccounts)

setInterval(() => container._update(), 1000)

