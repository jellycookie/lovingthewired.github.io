
_global_elements = []

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
    this.selector.addEventListener('change', this._onchange.bind(this))
    this.selector.addEventListener('keyup', e => { if (e.key === 'Enter') this._onchange.bind(this) })

    this.info = this.selector

    this.init(this._id, this._data)
    this.children.forEach(e => e._init())
  }
  init(id, data) { }

  _update() {
    // console.log('calling update', this._id, this._data)
    this.update(this._id, this._data)
    this.children.forEach(e => e._update())
  }
  update(id, data) { }

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
    let infoHtml = `<div class="label"><span id="id${id}"><span></div>`
    let labelHtml = `<div class="label"><span>${data}</span></div>`
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

  init() {
    this.selector.addEventListener('click', this._onclick.bind(this))
  }

}


class ArgInputField extends Element {

  render(id, data) {
    let html = ''
    html += `<input type="text" class="textInput" id="id${id}" placeholder="${data.placeholder}">`
    html += `<div class="textInputInfo"><span id="infoId${id}" class="label"></span></div>`
    if (data.standalone) html = `<div class="group"><span class="label">${data.label || ''}</span>` + html + '</div>'
    else html = '<div>' + html + '</div>'
    return html
  }

  async _onchange() {
    // console.log('_change', this._id)

    try { this.setInfo(await this.parse()) }
    catch (e) { this.setInfo(e) }

    this.onchange(this._id, this._data)
    if (this.parent != undefined) this.parent._onchange()
  }

  async parse() {
    let value = this.getValue()
    let data = this._data
    // console.log('parsing')
    // console.log(data, value)
    if (data.type === 'address') return await getAccountInfo(value)
    // if (data.type === 'addressfrom') return await getAccountInfo(value, 'person')
    if (data.type === 'person') return await getAccountInfo(value, 'person')
    if (data.type === 'contract') return await getAccountInfo(value, 'contract')
    if (data.type === 'erc721') return await getAccountInfo(value, 'erc721')
    if (data.type === 'ether') return validateCurrency(value, 'ether', true)
    if (data.type === 'gwei') return validateCurrency(value, 'gwei', true)
    if (data.type === 'function') return await parseFunction(value, data.allowNegate)
    if (data.type === 'data') return ''
    if (data.type === 'key') {
      let key = web3.eth.accounts.privateKeyToAccount(value).address
      return key + ' ' + await getAccountInfo(key, 'person')
    }
    return value
  }

  update(id, data) {
    if (data.name === 'from') {
      let address = this.getValue() || getDefaultAddress()
      this.selector.placeholder = `${data.placeholder} [${address}]`
    }
    if (data.name === 'nonce') {
      let address = this.parent.args.from.getValue() || getDefaultAddress()
      let selector = this.selector
      web3.eth.getTransactionCount(address)
        .then(nonce => selector.placeholder = `${data.placeholder} [${nonce}]`)
    }
  }

  init(id) {
    this.info = document.querySelector(`#infoId${id}`)
  }

  getValue() {
    let value = this.selector.value
    // if (this._data.type == 'addressfrom' && value === '') value = accounts[0]
    return value
  }

  getArgValues() {
    let arg = {}
    arg[this._data.name] = this.getValue()
    return arg
  }
}


class Function extends Element {
  render(id, data) {
    this.button = this.appendChild(new ArgButton({ name: data.methodName, enabled: data.enabled }, this))
    this.args = {}

    let htmlArgs = ''
    for (let arg of data.args) {
      // arg._standalone = false
      this.args[arg.name] = this.appendChild(new ArgInputField(arg, this))
      htmlArgs += this.args[arg.name]._render()
    }
    htmlArgs = `<div class="functionArgGroup">` + htmlArgs + '</div>'

    let headerHtml = `<div class="functionHeader">${data.methodName}</div>`
    let dataHtml = `<div><div class="functionDataInfoHeader"><span id="dataInfoHeaderId${id}"></span></div><div class="functionDataInfo"><span id="dataInfoId${id}"></span></div></div>`

    let html = ''
    html = this.button._render() + htmlArgs + dataHtml
    html = '<div class="functionInputDiv">' + html + '</div>'
    html = html + `<div class="functionInfoDiv"><span class="functionInfo" id="id${id}"></span></div>`
    html = `<div class="functionGroup" id="functionGroup${id}">` + html + '</div>'
    html = '<div class="group">' + headerHtml + html + '</div>'
    return html
  }

  getArgValues() {
    return objectMap(this.args, e => e.getValue())
  }

  init(id) {
    this.dataInfo = document.querySelector(`#dataInfoId${id}`)
    this.dataInfoHeader = document.querySelector(`#dataInfoHeaderId${id}`)
    this.group = document.querySelector(`#groupId${id}`)
  }

  _onchange() {
    this.onchange(this._id, this._data)
    if (this.parent != undefined) this.parent._onchange()
    this._update()
  }

  async onchange(id) {
    try {
      if (this._data.type === 'call') await this.sendTransactionWrapper()
      else await this.buildTransactionWrapper()
    }
    catch { }
  }


  async onclick(id, data) {
    this.sendTransactionWrapper()
  }

  async buildTransactionWrapper() { // throws
    let tx
    let valid = true
    let msg = ''

    try { tx = await this.buildTransaction(this.getArgValues()) }
    catch (e) { msg = e; valid = false; }

    this.setInfo(msg)

    let dataInfo = parseData(tx.data)
    this.dataInfo.innerText = dataInfo
    this.dataInfoHeader.innerText = (dataInfo === '') ? '' : 'Data'
    // console.log(tx.data, parseData(tx.data))

    if (valid) this.button.selector.disabled = false
    else { this.button.selector.disabled = true; throw msg }

    if ('gasLimit' in this.args) this.args.gasLimit.selector.placeholder = `gasLimit [${web3.utils.hexToNumberString(tx.gas)}]`

    return tx
  }

  async sendTransaction() { // throws
    let tx = await this.buildTransactionWrapper()
    return await sendTransaction(tx, this._data.type)
  }

  async sendTransactionWrapper() {  // doesn't throw
    let response
    let valid = true
    let msg = ''

    try { response = await this.sendTransaction() }
    catch (e) { msg = e.message; valid = false; }

    // if (valid) this.button.selector.disabled = false
    // else { this.setInfo(msg); this.button.selector.disabled = true }

    this.setInfo(valid ? response : msg)
    return msg
  }


}

class CheckBox extends ArgButton {
  render(id, data) {
    return `<div class="group" id="groupId${id}"><span class="label">${data.label}</span><input type="checkbox" id="id${id}"><span id="infoId${id}" class="label"></span></div>`
  }
  init(id) {
    this.selector.addEventListener('click', this._onclick.bind(this))
    this.info = document.querySelector(`#infoId${id}`)
    this.group = document.querySelector(`#groupId${id}`)
  }

}
