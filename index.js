

$ = document.querySelector.bind(document)




let accounts = []








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
  console.log('callTx build', args)
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

var checkInterval = 5000
sendTxCondBox = new CheckBox({ label: 'when possible' })
sendTxCondBox.dots = 1
sendTxCondBox.onchange = function () {
  let watching = this.selector.checked
  this.setInfo(watching ? 'watching' + '.'.repeat(this.dots++ % (1000 / checkInterval)) : '')
  if (watching) {
    this.sendLock = false
    let interval = this.interval = setInterval(async () => {
      if (this.sendLock) return
      let valid = true
      console.log('check')
      try { beep(); await sendTx.buildTransactionWrapper() }
      catch { valid = false }
      if (valid) {
        try { this.sendLock = true; await sendTx.sendTransactionWrapper() } // can still be low level invalid
        catch { valid = false }
        this.sendLock = false
      }

      if (valid) {
        this.selector.checked = false
        this.setInfo('Transaction sent!')
        clearInterval(interval)
      }

    }, checkInterval);
  } else clearInterval(this.interval)
}.bind(sendTxCondBox)



// MULTICALL


deployMultTx = new Function({
  methodName: 'deploy',
  type: 'send',
  enabled: true,
  args: [{ name: 'from', placeholder: 'from', type: 'addressfrom' }]
})
deployMultTx.buildTransaction = async (args) => {

  let key = web3.utils.soliditySha3(args.from, 'hahahaha').slice(2)
  let data = multicallDeployData + key

  return buildTransaction('', '', '', '', '', data)
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

  let tokenAddr = web3.utils.toChecksumAddress(args.tokenAddr)
  let tokenIds = args.tokenIds.split(',')

  let data = web3.eth.abi.encodeFunctionCall({
    name: 'withdrawToken', type: 'function',
    inputs: [{ type: 'address', name: 'addr', payable: true, },
    { type: 'uint256[]', name: 'tokenIds' }]
  }, [tokenAddr, tokenIds])

  let tx = buildTransaction('', multicallAddress, '', '', '', data)

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

// infoPanel = new Panel([
//   chainLabel,
//   accountLabel,
// ])

sendTxCondition = new Panel([
  sendTxCondBox,
  // sendTxCondCall,
], "auto send under conditon")

txPanel = new Panel([
  callTx,
  sendTx,
  sendTxCondition,
])

mainPanel = new Panel([
  // infoPanel,
  chainLabel,
  accountLabel,
  txPanel,
  multiPanel,
])

container = new Panel([
  warningBanner,
  mainPanel,
], '', true)

document.body.innerHTML = container._render()
container._init()

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
console.log('Rinkeby multicall', "0x16a8F24AAFA68B0A610079786C78dd5D67fD4610")
console.log('Rinkeby On1', "0x3bf2922f4520a8BA0c2eFC3D2a1539678DaD5e9D")  // ON1 Main
console.log('Rinkeby Chip', "0x6302c083ce0f5d0142e2a2d743e78d936232db6c")  // Chipto Rinkeby
console.log('Rinkeby Dogu', "0xe689c7c5a5e6fa5d0f5d0c5be165bcb73c2d5d9c")     // DOGU Rinkeby
console.log('Main 0n1', "0x0692f6f933A3d050779472daE386b297269B4108")     // On1 Rinkeby
console.log('Main Chipto', "0xf3ae416615A4B7c0920CA32c2DfebF73d9D61514")  // Chipto
console.log('Main Dogu', "0x9c0ffc9088abeb2ea220d642218874639229fa7a")     // DOGU



// expertMode = false
// $('.expertMode').addEventListener('change', () => {
//   snipeWatching = false
//   clearInterval(interval);
//   expertMode = $('.expertMode').checked
//   if (expertMode) $('.snipeButton').innerText = 'Snipe (privKey), Dangerous!!'
//   else $('.snipeButton').innerText = 'Snipe (MetaMask)!'
//   updateTxStatus()
// })

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

// sendTxCondCall = new ArgInputField({ name: 'function', placeholder: 'function / hash', type: 'function', standalone: true, label: 'is true', allowNegate: true }) //add standalone output
// sendTxCondCall.buildTransaction = async (args) => {
//   to = sendTx.args.to.getValue()
//   if (to == '') throw '^Invalid Address'
//   // if (args.function == '') throw 'Invalid Function'
//   return await buildTransaction(
//     '',
//     to,
//     '',
//     '',
//     args.function,
//     '',
//     'call',
//   )
// }
// sendTxCondCall.onchange = async function () {
//   // let txCondition = await sendTxCondCall.buildTransactionWrapper()
//   let valid = true
//   let msg = ''
//   try {
//     console.log('building')
//     let tx = await this.buildTransaction({ function: this.getValue() })
//     console.log('sending')
//     let result = await sendTransaction(tx, 'call')
//     console.log('sendTxCondCall result', result)
//     valid = web3.eth.abi.decodeParameter('bool', result)
//     console.log('valid', valid)
//     this.setInfo(valid);
//   }
//   catch (e) { this.setInfo(e.message); valid = false; }

//   if (!valid) return

//   let tx;
//   try {
//     tx = sendTx.buildTransaction(sendTx.getArgValues())
//   } catch (e) { this.setInfo('^Invalid Transaction'); valid = false; }

//   console.log(tx)
//   await sendTransaction(tx)
// }.bind(sendTxCondCall)
// privKey = web3.eth.accounts.create().privateKey
// $('.testAccountPrivKey').innerText = 'Test account private key: ' + privKey
// $('.privKey').addEventListener('change', async () => {
//   $('.expertMode').style.display = 'unset'
//   $('.expertModeInfo').style.display = 'unset'
//   testAccount = web3.eth.accounts.privateKeyToAccount($('.privKey').value)
// })

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
