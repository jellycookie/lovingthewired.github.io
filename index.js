$ = document.querySelector.bind(document)

// import "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
// import * as Web3 from "https://unpkg.com/web3@latest/dist/web3.min.js"
// import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";

toBN = Web3.utils.toBN

toWei = Web3.utils.toWei
fromWei = Web3.utils.fromWei
sha3 = Web3.utils.sha3


let accounts = [];
async function getAccount() {
  accounts = await ethereum.request({ method: 'eth_requestAccounts' });
}
window.addEventListener('load', getAccount)

var web3 = new Web3(Web3.givenProvider)

function beep() {
  var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
  snd.play();
}


// DEPLOY

$('.createButton').addEventListener('click', () => {
  data = $('.deployData').value
  ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: accounts[0],
      data: data,
    }]
  })
    .then((txHash) => console.log(txHash))
    .catch((error) => console.error);
});


// SEND
$('.sendValue').addEventListener('change', () => {
  $('.sendValueInfo').innerText = ($('.sendValue').value * 1e18) + ' wei'
  $('.mintPrice').value = ''
  $('.mintAmount').value = ''
})
$('.sendFn').addEventListener('change', () => {
  $('.sendFnInfo').innerText = getFnHash($('.sendFn').value)
})
$('.sendData').addEventListener('change', () => {
  $('.sendDataInfo').innerText = pad32Bytes($('.sendData').value)
  $('.mintPrice').value = ''
  $('.mintAmount').value = ''
})

$('.sendButton').addEventListener('click', sendTransaction)


function toWeiHex(amount, type = 'ether') {
  return (amount === '') ? '0' : toBN(toWei(amount, type)).toString(16)
}

function sendTransaction() {
  to = $('.sendTo').value
  value = toWeiHex($('.sendValue').value)

  fn = getFnHash($('.sendFn').value)
  data = fn + pad32Bytes($('.sendData').value)
  // console.log( { from: accounts[0], to: to, data: data, value: value, })
  gasPrice = toWeiHex($('.sendGas').value, 'gwei')

  params = [{
    from: accounts[0],
    to: to,
    data: data,
    value: value,
  }]
  if (gasPrice != '0') params[0]['gasPrice'] = gasPrice

  ethereum.request({
    method: 'eth_sendTransaction',
    params: params,
  })
    .then((txHash) => console.log(txHash))
    .catch((e) => console.error(e));
}


// SNIPE
$('.mintPrice').addEventListener('change', () => {
  $('.sendValue').value = $('.mintPrice').value * parseInt($('.mintAmount').value)
})
$('.mintAmount').addEventListener('change', () => {
  $('.sendValue').value = $('.mintPrice').value * parseInt($('.mintAmount').value)
  $('.sendData').value = pad32Bytes($('.mintAmount').value)
})

snipeWatching = false
sniped = false
var checkInterval = 300
var interval = 0

$('.snipeButton').addEventListener('click', () => {
  if (snipeWatching) {
    clearInterval(interval);
    $('.mintInfo').innerText = 'Stopped'
    snipeWatching = false
    $('.mintInfo').style.backgroundColor = ''
  } else {
    $('.mintInfo').innerText = 'Checking..'
    sniped = false
    interval = setInterval(function () {
      fn = $('.mintFn').value
      negate = false
      if (fn[0] === '!') {
        fn = fn.slice(1,)
        negate = true
      }
      contract = new web3.eth.Contract(abi, $('.sendTo').value)
      contract.methods[fn].call().call().then((status) => {
        if (negate) status = !status
        $('.mintInfo').innerText = 'Live: ' + String(status)
        $('.mintInfo').style.backgroundColor = status ? 'lightgreen' : 'orange'
        if (status && !sniped) {
          clearInterval(interval);
          sniped = true
          beep()
          sendTransaction()
        }
      })
      console.log('check')
    }, checkInterval);
    snipeWatching = true

  }
});

address = "0x3bf2922f4520a8BA0c2eFC3D2a1539678DaD5e9D"  // ON1 Main
// address = "0x0692f6f933A3d050779472daE386b297269B4108"
$('.sendTo').value = address
$('.callTo').value = address
$('.mintFn').value = "!isAllowListActive()"
$('.sendFn').value = "purchase(uint256)"
$('.mintPrice').value = '0.07777'
contract = new web3.eth.Contract(abi, $('.sendTo').value)

/* ethereumButton.addEventListener('click', () => {
  getAccount();
}); */





// CALL

function getFnHash(fn) {
  if (fn.slice(0, 2) !== '0x') fn = sha3(fn).slice(0, 10)
  return fn
}

$('.callFn').addEventListener('change', () => {
  $('.callFnInfo').innerText = getFnHash($('.callFn').value)
})
$('.callData').addEventListener('change', () => {
  $('.callDataInfo').innerText = pad32Bytes($('.callData').value)
})

$('.callButton').addEventListener('click', () => {
  to = $('.callTo').value
  fn = getFnHash($('.callFn').value)
  data = $('.callData').value

  contract = new web3.eth.Contract(abi, $('.sendTo').value)
  contract.methods[fn].call().call().then((status) => {
    $('.callInfo').innerText = String(status)
    console.log(status)
  })
  // ethereum
  //   .request({
  //     method: 'eth_call',
  //     params: [
  //       {
  //         to: to,
  //         data: data,
  //       },
  //     ],
  //   })
  //   .then((txHash) => console.log(txHash))
  //   .catch((e) => console.error(e));
});



// ENCODE
$('.sha3Input').addEventListener('change', (e) => {
  $('.sha3Output').innerText = sha3($('.sha3Input').value)
})

$('.padInput').addEventListener('change', (e) => {
  $('.padOutput').innerText = pad32Bytes($('.padInput').value)
})

function pad32Bytes(data) {
  var s = String(data);
  while (s.length < (64 || 2)) { s = "0" + s; }
  return s;
}

// function toWeiHex(ether) {
//   return '0x' + pad32Bytes((ether * 1e18).toString(16))
// }