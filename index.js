$ = document.querySelector.bind(document)



_global_elements = []


let accounts = []


class Element {
  constructor(data, parent = undefined) {
    this._data = data
    this._id = _global_elements.length
    _global_elements.push(this)
    // console.log('constructor call', data, this._id)

    this.parent = parent
    this.children = []
    this._listener = undefined
  }

  appendChild(child) {
    child.parent = this
    this.children.push(child)
    return child
  }

  renderChildren() {
    let html = ''
    for (let child of this.children)
      html += child._render()
    return html
  }

  _render() {
    return this.render(this._id, this._data)
  }
  render(id, data) { }

  _init() {
    // console.log(this, '_init', this._id)
    this.selector = document.querySelector(`#id${this._id}`)
    this.info = this.selector
    this.init(this._id, this._data)
    this.children.forEach(e => e._init())
  }
  init(id, data) { }

  oninput() { }
  onclick() { }
  onchange() { }

  _onclick() {
    // console.log('_click', this._id)
    this.onclick(this._id, this._data)
    if (this.parent != undefined) this.parent._onclick()
  }
  _onchange() {
    // console.log('_change', this._id)
    this.onchange(this._id, this._data)
    if (this.parent != undefined) this.parent._onchange()
  }

  setListener(listener) {
    this._listener = listener
  }

  setInfo(text) {
    this.info.innerText = text
  }
}

class Banner extends Element {
  render(id) { return `<div class="banner"><p id="id${id}"></p></div>` }
}

class Label extends Element {
  render(id, data) {
    let infoHtml = `<div><span id="id${id}"><span></div>`
    let labelHtml = `<div><span class="label">${data}</span></div>`
    let html = '<div class="labelGroup">' + labelHtml + infoHtml + '</div>'
    return '<div class="group">' + html + '</div>'
  }
}

class Panel extends Element {
  constructor(elements, name = '', topLevel = false) {
    super()
    elements.forEach(e => this.appendChild(e))
    this.name = name
    this.topLevel = topLevel
  }

  render(id) {
    let panelHeader = `<div class="panelHeader">${this.name}</div>`
    let panel = panelHeader + '<div class="panelBody">' + this.renderChildren() + '</div>'
    return `<div class="${this.topLevel ? 'topLevel' : 'panel'}" id="id${id}">` + panel + '</div>'
  }
}

class ArgButton extends Element {

  render(id, data) {
    let html = `<button class="functionButton btn" id="id${id}" ${data.enabled ? '' : 'disabled="true"'}>${data.name}</button>`
    html = '<div class="functionButtonDiv">' + html + '</div>'
    return html
  }

  init(id) {
    // console.log(this.selector)
    this.selector.addEventListener('click', this._onclick.bind(this))
  }
}

class ArgInputField extends Element {

  render(id, data) {
    let html = ''
    html += `<input type="text" class="textInput" id="id${id}" placeholder="${data.placeholder}">`
    html += `<div class="textInputInfo"><span id="infoId${id}"></span></div>`
    if (data.standalone) html = `<div class="group"><span>${data.label || ''}</span>` + html + '</div>'
    else html = '<div>' + html + '</div>'
    return html
  }

  async _onchange() {
    let value = this.getValue()
    let data = this._data
    if (data.type === 'address') this.setInfo(await getAccountInfo(value))
    if (data.type === 'addressfrom') this.setInfo(await getAccountInfo(value, 'person'))
    if (data.type === 'contract') this.setInfo(await getAccountInfo(value, 'contract'))
    if (data.type === 'erc721') this.setInfo(await getAccountInfo(value, 'erc721'))
    if (data.type === 'ether') this.setInfo(validateCurrency(value, 'ether', true))
    if (data.type === 'gwei') this.setInfo(validateCurrency(value, 'gwei', true))
    if (data.type === 'function') this.setInfo(await parseFunction(value, data.allowNegate))

    // console.log('_change', this._id)
    this.onchange(this._id, this._data)
    if (this.parent != undefined) this.parent._onchange()
  }

  init(id) {
    this.selector.addEventListener('change', this._onchange.bind(this))
    this.info = document.querySelector(`#infoId${id}`)
  }

  getValue() {
    let value = this.selector.value
    if (this._data.type == 'addressfrom' && value === '') value = accounts[0]
    return value
  }

}

async function parseFunction(func, allowNegate = false) {
  console.log('allowNeg', allowNegate)
  if (allowNegate && func[0] === '!') func = func.slice(1)
  console.log(func)
  if (func.slice(0, 2) == '0x' && func.length == 10) return func
  if (!func.match(/^[\d\w_-]+\(([\d\w]+)*(,[\d\w]+)*\)$/)) return 'Invalid Function'
  try { return await web3.eth.abi.encodeFunctionSignature(func) }
  catch (e) { return e }
}

function validateCurrency(amount, type = 'ether', allowEmpty = false) {
  if (allowEmpty && amount === '') return type
  try { web3.utils.toWei(amount, type) }
  catch (e) { return e }
  return type
}

class Function extends Element {
  render(id, data) {
    this.button = this.appendChild(new ArgButton({ name: data.methodName, enabled: data.enabled }, this))
    this.args = {}

    let html = ''
    for (let arg of data.args) {
      // arg._standalone = false
      this.args[arg.name] = this.appendChild(new ArgInputField(arg, this))
      html += this.args[arg.name]._render()
    }

    let headerHtml = `<div class="functionHeader">${data.methodName}</div>`

    html = `<div class="functionArgGroup">` + html + '</div>'
    html = this.button._render() + html
    html = '<div class="functionInputDiv">' + html + '</div>'
    html = html + `<div class="functionInfoDiv"><span class="functionInfo" id="id${id}"></span></div>`
    html = `<div class="functionGroup" id="functionGroup${id}">` + html + '</div>'
    html = '<div class="group">' + headerHtml + html + '</div>'
    return html
  }

  async onchange(id) {
    let valid = true
    let msg = ''
    try { await this.buildTransaction(this.getArgValues()) }
    catch (e) { msg = e; valid = false; }
    // await this.buildTransaction(this.getArgValues())

    if (valid) this.button.selector.disabled = false
    else this.button.selector.disabled = true
    this.setInfo(msg)
  }


  async onclick(id, data) {
    // console.log('clicl', this._id, this)
    let tx = await this.buildTransaction(this.getArgValues())
    console.log(tx)
    let result = await sendTransaction(tx, data.type)
    this.setInfo(result)
  }

  getArgValues() {
    return objectMap(this.args, e => e.getValue())
  }

}



const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )


async function isContract(address) {
  return await web3.eth.getCode(address) !== '0x'
}

async function getAccountInfo(address, type = 'any') {
  let info = ''
  let to = ''
  // console.log('query for ', address, type)

  try { to = web3.utils.toChecksumAddress(address) }
  catch (e) { return e }

  let is_erc721 = false
  let is_contract = await isContract(to)
  if ((type == 'contract' || type == 'erc721') && !is_contract) return 'Error: address is not a contract'
  if (type == 'person' && is_contract) return 'Error: address is a contract'

  try {
    let bal = await web3.eth.getBalance(to)
    bal = parseFloat(web3.utils.fromWei(bal)).toFixed(2)

    info = `(${bal} eth)`
    // console.log('1')


    if (is_contract) {
      info += ' [Contract]'

      // console.log('2')
      let additional_info = ''
      try {
        tx = { to: to, data: web3.eth.abi.encodeFunctionSignature('name()') }
        _name = await ethereum.request({ method: 'eth_call', params: [tx] })
        _name = web3.eth.abi.decodeParameter('string', _name)

        tx = { to: to, data: web3.eth.abi.encodeFunctionSignature('symbol()') }
        symbol = await ethereum.request({ method: 'eth_call', params: [tx] })
        symbol = web3.eth.abi.decodeParameter('string', symbol)

        additional_info = ` ${_name} (${symbol})`
        is_erc721 = true
      } catch (e) { }
      info += additional_info

      // console.log('3')
      additional_info = ''
      try {
        tx = { to: to, data: web3.eth.abi.encodeFunctionSignature('owner()') }
        owner = await ethereum.request({ method: 'eth_call', params: [tx] })
        owner = web3.eth.abi.decodeParameter('address', owner)

        additional_info = ` , owner: ${owner}`
      } catch (e) { }
      info += additional_info

    }

  } catch (e) { info = 'Error: ' + e.message }
  if (type === 'erc721' && !is_erc721) return 'Error: contract is not ERC721'
  // console.log('returned ', info)

  return info
}



// CALL

callTx = new Function({
  methodName: 'Call',
  type: 'call',
  args: [
    { name: 'to', placeholder: 'to', type: 'address' },
    { name: 'function', placeholder: 'function / hash', type: 'function' },
    { name: 'data', placeholder: 'data', type: 'string' },
  ]
})

callTx.buildTransaction = async (args) => {
  return await buildTransaction(
    '',
    args.to,
    '',
    '',
    args.function,
    args.data,
  )
}



// SEND TRANSACTION

sendTx = new Function({
  methodName: 'Send Transaction',
  type: 'send',
  args: [
    { name: 'from', placeholder: 'from', type: 'addressfrom' },
    { name: 'to', placeholder: 'to', type: 'address' },
    { name: 'value', placeholder: 'value (eth)', type: 'ether' },
    { name: 'gasPrice', placeholder: 'gas (gwei)', type: 'gwei' },
    { name: 'function', placeholder: 'function / hash', type: 'function' },
    { name: 'data', placeholder: 'data', type: 'string' },
  ]
})


sendTx.buildTransaction = async (args) => {
  return await buildTransaction(
    args.from,
    args.to,
    args.value,
    args.gasPrice,
    args.function,
    args.data,
  )
}

// SEND CONDITION

sendTxCondition = new ArgInputField({ name: 'function', placeholder: 'function / hash', type: 'function', standalone: true, label: 'is true', allowNegate: true }) //add standalone output
sendTxCondition.buildTransaction = async (args) => {
  to = sendTx.args.to.getValue()
  if (to == '') throw '^Invalid Address'
  // if (args.function == '') throw 'Invalid Function'
  return await buildTransaction(
    '',
    to,
    '',
    '',
    args.function,
    '',
    'call',
  )
}
sendTxCondition.onchange = async () => {
  let valid = true
  let msg = ''
  try {
    console.log('building')
    let tx = await sendTxCondition.buildTransaction({ function: sendTxCondition.getValue() })
    console.log('sending')
    let result = await sendTransaction(tx, 'call')
    console.log('sendTxCondition result', result)
    valid = web3.eth.abi.decodeParameter('bool', result)
    console.log('valid', valid)
    sendTxCondition.setInfo(valid);
  }
  catch (e) { sendTxCondition.setInfo(e.message); valid = false; }

  if (!valid) return

  let tx;
  try {
    tx = sendTx.buildTransaction(sendTx.getArgValues())
  } catch (e) { sendTxCondition.setInfo('^Invalid Transaction'); valid = false; }

  console.log(tx)
  await sendTransaction(tx)
}



// MULTICALL


deployMultTx = new Function({
  methodName: 'deploy',
  type: 'send',
  enabled: true,
  args: [{ name: 'from', placeholder: 'from', type: 'addressfrom' }]
})
deployMultTx.buildTransaction = async (args) => {
  let from = web3.utils.toChecksumAddress(args.from)

  let key = web3.utils.soliditySha3(from, 'hahahaha').slice(2)
  let data = multicallDeployData + key
  let tx = { from: from, data: data }

  tx.gas = await eth_estimateGas(tx)
  return tx
}

let deployedToField = new ArgInputField({ name: 'to', placeholder: 'multicall deployed address', type: 'contract' })

withdrawTokenTx = new Function({
  methodName: 'Withdraw Token',
  type: 'send',
  args: [
    { name: 'from', placeholder: 'from', type: 'addressfrom' },
    { name: 'tokenAddr', placeholder: 'tokenAddr', type: 'erc721' },
    { name: 'tokenIds', placeholder: 'token Ids' },
  ]
})

withdrawTokenTx.buildTransaction = async (args) => {

  let multicallAddress = deployedToField.getValue()
  if (multicallAddress === '') throw 'Multicall not deployed.'

  let from = web3.utils.toChecksumAddress(args.from)
  let to = web3.utils.toChecksumAddress(multicallAddress)
  let tokenAddr = web3.utils.toChecksumAddress(args.tokenAddr)
  let tokenIds = args.tokenIds.split(',')

  let data = web3.eth.abi.encodeFunctionCall({
    name: 'withdrawToken',
    type: 'function',
    inputs: [
      { type: 'address', name: 'addr', payable: true, },
      { type: 'uint256[]', name: 'tokenIds' },
    ]
  }, [tokenAddr, tokenIds]
  )
  let tx = { from: from, to: to, data: data }
  tx.gas = await eth_estimateGas(tx)

  return tx
}


multTx = new Function({
  methodName: 'BatchMint',
  type: 'send',
  args: [
    { name: 'from', placeholder: 'from', type: 'addressfrom' },
    { name: 'tokenAddr', placeholder: 'tokenAddr', type: 'erc721' },
    { name: 'mintPrice', placeholder: 'mintPrice (eth)', type: 'ether' },
    { name: 'gasPrice', placeholder: 'gas (gwei)', type: 'gwei' },
    { name: 'function', placeholder: 'mint function / hash', type: 'function' },
    { name: 'numCalls', placeholder: 'numCalls', type: 'string' },
  ]
})


multTx.buildTransaction = async (args) => {
  console.log('build', args)
  let from = web3.utils.toChecksumAddress(args.from)

  // console.log('1')

  let multicallAddress = deployedToField.getValue()
  if (multicallAddress === '') throw 'Multicall not deployed.'
  let to = web3.utils.toChecksumAddress(multicallAddress)

  let tokenAddr = web3.utils.toChecksumAddress(args.tokenAddr)
  let mintFn = args.function
  let mintFnCallData = web3.eth.abi.encodeFunctionCall({ name: mintFn, type: 'function', inputs: [{ type: 'uint256', name: '' }] }, ['1'])

  let numCalls = args.numCalls
  let mintPrice = web3.utils.toWei(args.mintPrice, 'ether')
  let value = web3.utils.toHex(web3.utils.toBN(mintPrice).mul(web3.utils.toBN(numCalls)).toString())

  let mintPriceHex = web3.utils.toHex(mintPrice)

  if (gasPrice !== '') tx.gasPrice = web3.utils.numberToHex(web3.utils.toWei(args.gasPrice, 'gwei'))

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
  let tx = { from: from, to: to, value: value, data: data, gasPrice: gasPrice }
  // console.log(tx)
  tx.gas = await eth_estimateGas(tx)

  return tx
}


function encodeFunctionCall(func, data) {
  // console.log('encode', func, data)
  if (func === '') return data
  if (func.slice(0, 2) === '0x') return func + data
  if (data == '') return web3.eth.abi.encodeFunctionSignature(func)

  let input_types = func.match(/\((.*)\)/g)[0].slice(1, -1).split(',')
  let inputs = input_types.map(e => { return { type: e, name: '' } })
  // console.log(func, inputs, data.split(','))

  return web3.eth.abi.encodeFunctionCall({
    name: func,
    type: 'function',
    inputs: inputs
  }, data.split(','))
}



async function buildTransaction(from, to, value, gasPrice, func, data, type = 'send') {
  let tx = {}

  console.log(from, to, value,)

  if (from === '') from = accounts[0]
  tx.from = web3.utils.toChecksumAddress(from)


  if (to !== '') tx.to = web3.utils.toChecksumAddress(to)
  if (value !== '') tx.value = web3.utils.numberToHex(web3.utils.toWei(value, 'ether'))

  tx.data = encodeFunctionCall(func, data)
  console.log('tx', tx)

  if (type === 'send') {
    tx.gas = await eth_estimateGas(tx)
    // console.log('gas', tx.gas)
    if (gasPrice !== '') tx.gasPrice = web3.utils.numberToHex(web3.utils.toWei(gasPrice, 'gwei')) // XXX: NOTE needs to be set for expert mode
  }

  return tx
}

async function sendTransaction(tx, type = 'send') {
  if (type == 'send') method = 'eth_sendTransaction'
  if (type == 'call') method = 'eth_call'
  return await ethereum.request({ method: method, params: [tx] })
}

warningBanner = new Banner('warning')
warningBanner.onchange = async () => {
  warningBanner.setInfo(ethereum.chainId == 1 ? 'WARNING: CURENTLY ON MAINNET' : '')
  if (ethereum.chainId == 1)
    warningBanner.selector.style.display = 'unset'
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

multiPanel = new Panel([
  deployMultTx,
  deployedToField,
  withdrawTokenTx,
  multTx,
], "MultiCall")

infoPanel = new Panel([
  chainLabel,
  accountLabel,
])

txPanel = new Panel([
  callTx,
  sendTx,
  sendTxCondition,
])

mainPanel = new Panel([
  infoPanel,
  txPanel,
  multiPanel,
])

container = new Panel([
  warningBanner,
  mainPanel,
], '', true)

document.body.innerHTML = container._render()
container._init()


async function eth_estimateGas(tx, buffer = 1.2) {
  try {
    let gasLimit = await ethereum.request({ method: 'eth_estimateGas', params: [tx] })
    return web3.utils.toHex(parseInt(buffer * gasLimit))
  } catch (e) { throw e.message }
}

function isValidAddress(address) {
  try { web3.utils.toChecksumAddress(address) }
  catch { return false }
  return true
}


var web3 = new Web3(Web3.givenProvider)

async function reloadAccounts() {
  accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  accountLabel.onchange()
  warningBanner.onchange()
  chainLabel.onchange()
}
ethereum.on('chainChanged', reloadAccounts)
ethereum.on('accountsChanged', reloadAccounts)
window.addEventListener('load', reloadAccounts)












// // const provider = new ethers.providers.Web3Provider(window.ethereum)

// // 0xe8a15fe5c4c12799776fb6f2b5b0b7205552cc7e // mystery man
// $('.multAddress').value = '0x16a8F24AAFA68B0A610079786C78dd5D67fD4610'
// // address = "0x6302c083ce0f5d0142e2a2d743e78d936232db6c"  // Chipto Rinkeby
// // address = "0xf3ae416615A4B7c0920CA32c2DfebF73d9D61514"  // Chipto
// // address = "0x3bf2922f4520a8BA0c2eFC3D2a1539678DaD5e9D"  // ON1 Main
// // address = "0x0692f6f933A3d050779472daE386b297269B4108"     // On1 Rinkeby
// // address = "0x9c0ffc9088abeb2ea220d642218874639229fa7a"     // DOGU
// address = "0xe689c7c5a5e6fa5d0f5d0c5be165bcb73c2d5d9c"     // DOGU Rinkeby

// privKey = web3.eth.accounts.create().privateKey
// $('.testAccountPrivKey').innerText = 'Test account private key: ' + privKey
// $('.privKey').addEventListener('change', async () => {
//   $('.expertMode').style.display = 'unset'
//   $('.expertModeInfo').style.display = 'unset'
//   testAccount = web3.eth.accounts.privateKeyToAccount($('.privKey').value)
// })

// function beep() {
//   var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
//   snd.play();
// }

// var ABI
// var web3Contract

// function updateABI() {
//   abi = $('.abi').value
//   if (abi !== '') ABI = JSON.parse(abi)
//   web3Contract = new web3.eth.Contract(ABI)
// }

// $('.abi').addEventListener('change', updateABI)




// SNIPE

// var checkInterval = 200

// snipeWatching = false
// var interval = 0

// $('.snipeButton').addEventListener('click', () => {
//   if (snipeWatching) {
//     clearInterval(interval);
//     $('.mintInfo').innerText = 'Stopped'
//     snipeWatching = false
//     $('.mintInfo').style.backgroundColor = ''
//   } else {
//     $('.mintInfo').innerText = 'Checking..'
//     interval = setInterval(mintCondition, checkInterval);
//     snipeWatching = true
//   }
// });

// expertMode = false
// $('.expertMode').addEventListener('change', () => {
//   snipeWatching = false
//   clearInterval(interval);
//   expertMode = $('.expertMode').checked
//   if (expertMode) $('.snipeButton').innerText = 'Snipe (privKey), Dangerous!!'
//   else $('.snipeButton').innerText = 'Snipe (MetaMask)!'
//   updateTxStatus()
// })

// function mintConditionReached() {
//   clearInterval(interval);
//   snipeWatching = false
//   beep()
//   if (expertMode) sendTransactionPrivKey()
//   else sendTransaction()
// }

// function sendTransactionPrivKey() {
//   tx = getTransaction(testAccount.address)
//   signedTx = web3.eth.accounts.signTransaction(tx, testAccount.privateKey)
//   // console.log(signedTx)
//   sentTx = web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//   // console.log(sentTx)
//   // getTransaction(testAccount.address)
//   //   .then(tx => {
//   //     console.log(tx)
//   //     web3.eth.accounts.signTransaction(tx, testAccount.privateKey)
//   //       .then(signedTx => {
//   //         console.log(signedTx)
//   //         web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//   //           .then(console.log)
//   //       })

//   //   })
// }

// async function validMintCondition() {
//   valid = false
//   fn = $('.mintStatusFn').value
//   if (fn !== '') {
//     valid = true
//     if (fn[0] === '!') fn = fn.slice(1,)
//     try {
//       await ethereum.request({ method: 'eth_call', params: [{ to: web3.utils.toChecksumAddress($('.sendTo').value), data: getFnHash(fn) }] })
//     } catch { valid = false }
//   }

//   time = $('.mintblockTime').value
//   if (time !== '') {
//     timeLeft = new Date(new Date(time * 1000) - new Date())
//     if (timeLeft.toString() !== 'Invalid Date') valid = true
//   }
//   return valid
// }

// async function mintCondition() {
//   fn = $('.mintStatusFn').value
//   if (fn !== '') {
//     negate = false
//     if (fn[0] === '!') {
//       fn = fn.slice(1,)
//       negate = true
//     }
//     await ethereum.request({ method: 'eth_call', params: [{ to: $('.sendTo').value, data: getFnHash(fn) }] })
//       .then((status) => {
//         status = Boolean(parseInt(status))
//         if (negate) status = !status
//         $('.mintInfo').innerText = 'Live: ' + String(status)
//         $('.mintInfo').style.backgroundColor = status ? 'lightgreen' : 'orange'
//         if (status && snipeWatching) mintConditionReached()
//       })
//   }

//   time = $('.mintblockTime').value
//   if (time !== '') {
//     timeLeft = new Date(new Date(time * 1000) - new Date())
//     if (timeLeft.toString() === 'Invalid Date') throw 'Invalid Date'
//     $('.mintInfo').innerText = `Time left: ${timeLeft < 0 ? '-' : ''}${timeLeft.getHours()}h ${timeLeft.getMinutes()}m ${timeLeft.getSeconds()}s`

//     if (timeLeft < 0) {
//       $('.mintInfo').style.backgroundColor = 'lightgreen'
//       mintConditionReached()
//     }
//     else $('.mintInfo').style.backgroundColor = 'orange'
//   }

//   console.log('check')
// }