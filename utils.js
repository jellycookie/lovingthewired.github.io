
function beep() {
  var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
  snd.play();
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


function encodeFunctionCall(func, data) {
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
    try { tx.gas = await eth_estimateGas(tx) }
    catch (e) { throw e.message }
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


async function eth_estimateGas(tx, buffer = 1.2) {
  let gasLimit = await ethereum.request({ method: 'eth_estimateGas', params: [tx] })
  return web3.utils.toHex(parseInt(buffer * gasLimit))
}

function isValidAddress(address) {
  try { web3.utils.toChecksumAddress(address) }
  catch { return false }
  return true
}

