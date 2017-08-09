'use strict'

let cp, cm

document.addEventListener('DOMContentLoaded', () => ipcRenderer.send('init-colorpicker'), false)

ipcRenderer.on('init', (event, config) => {
  if (config.posButton === 'right') document.querySelector('.toolbar').classList.add('setRight')
  initButtonsType(config.typeButton)
  cp = new Colorpicker(config.color)
  cm = new ContextMenu()
  initEvents()
})

ipcRenderer.on('shortSave', () => cm.save())
ipcRenderer.on('shortCopyHex', () => cm.copyHex())
ipcRenderer.on('shortCopyRGB', () => cm.copyRGB())
ipcRenderer.on('shortNegative', () => cp.setNegativeColor())
ipcRenderer.on('shortPin', () => togglePin())
ipcRenderer.on('shortShading', () => toggleShading())
ipcRenderer.on('shortOpacity', () => toggleOpacity())
ipcRenderer.on('shortRandom', () => toggleRandom())

function initButtonsType (type) {
  const appButtons = document.querySelector('#app_buttons')
  const minimize = document.querySelector('#minimize')
  const maximize = document.querySelector('#maximize')
  const close = document.querySelector('#close')
  switch (type) {
    case 'windows':
      appButtons.classList.add('windows')
      minimize.classList.add('fa', 'fa-window-minimize')
      maximize.classList.add('fa', 'fa-window-maximize')
      close.classList.add('fa', 'fa-window-close')
      break
    case 'linux':
      appButtons.classList.add('linux')
      minimize.classList.add('fa', 'fa-minus')
      maximize.classList.add('fa', 'fa-expand')
      close.classList.add('fa', 'fa-times-circle')
      break
    default:
      appButtons.classList.add('darwin')
      minimize.classList.add('fa', 'fa-circle')
      maximize.classList.add('fa', 'fa-circle')
      close.classList.add('fa', 'fa-circle')
  }
}

function changeLastColor (color) {
  ipcRenderer.send('changeLastColor', color)
}

function changebuttonsPosition (pos) {
  ipcRenderer.send('buttonsPosition', pos)
}

function changebuttonsType (type) {
  ipcRenderer.send('buttonsType', type)
}

function togglePin () {
  let bool = document.querySelector('#top_button').classList.toggle('active')
  ipcRenderer.send('setOnTop', bool)
}

function toggleShading () {
  let bool = document.querySelector('#shade_button').classList.toggle('active')
  ipcRenderer.send('shadingActive', bool)
  document.querySelector('header').classList.toggle('shading')
}

function toggleRandom () {
  const r = Math.floor(Math.random() * 255) + 0
  const g = Math.floor(Math.random() * 255) + 0
  const b = Math.floor(Math.random() * 255) + 0
  cp.setNewRGBColor([r, g, b])
}

function toggleOpacity () {
  let bool = cp.toggleOpacity()
  ipcRenderer.send('opacityActive', bool)
}

function initEvents () {
  window.addEventListener('contextmenu', event => {
    cm.openMenu('colorpickerMenu')
  })

  document.querySelector('#close').onclick = () => ipcRenderer.send('close')
  document.querySelector('#minimize').onclick = () => ipcRenderer.send('minimize')
  document.querySelector('#maximize').onclick = function () {
    let bool = this.classList.toggle('active')
    ipcRenderer.send('maximize', bool)
  }

  document.querySelector('#top_button').onclick = () => togglePin()
  document.querySelector('#shade_button').onclick = () => toggleShading()
  document.querySelector('#random_button').onclick = () => toggleRandom()
  document.querySelector('#opacity_button').onclick = () => toggleOpacity()

  document.querySelector('.red_bar input').oninput = function () {
    const red = this.value
    cp.setNewRGBColor([red, cp.green, cp.blue])
  }

  document.querySelector('.green_bar input').oninput = function () {
    const green = this.value
    cp.setNewRGBColor([cp.red, green, cp.blue])
  }

  document.querySelector('.blue_bar input').oninput = function () {
    const blue = this.value
    cp.setNewRGBColor([cp.red, cp.green, blue])
  }

  document.querySelector('.alpha_bar input').oninput = function () {
    cp.setNewAlphaColor(this.value / 255)
  }

  document.querySelector('#red_value').oninput = function () {
    let red = this.value
    if (red > 255) red = 255
    if (red < 0) red = 0
    cp.setNewRGBColor([red, cp.green, cp.blue])
  }

  document.querySelector('#green_value').oninput = function () {
    let green = this.value
    if (green > 255) green = 255
    if (green < 0) green = 0
    cp.setNewRGBColor([cp.red, green, cp.blue])
  }

  document.querySelector('#blue_value').oninput = function () {
    let blue = this.value
    if (blue > 255) blue = 255
    if (blue < 0) blue = 0
    cp.setNewRGBColor([cp.red, cp.green, blue])
  }

  document.querySelector('#alpha_value').oninput = function () {
    let alpha = this.value
    if (alpha === '0.') return
    if (alpha === '1.') return cp.setNewAlphaColor(1)
    console.log(alpha, alpha.length)
    if (isNaN(alpha) || alpha.length > 4) return cp.setNewAlphaColor(0)
    if (alpha > 1) alpha = 1
    if (alpha < 0) alpha = 0
    cp.setNewAlphaColor(alpha)
  }

  document.querySelector('#hex_value').oninput = function () {
    let hex = this.value.replace('#', '')
    if (hex.length !== 6) return
    cp.setNewColor(hex)
  }

  let els = document.querySelectorAll('#red_value, #green_value, #blue_value, #hex_value')
  for (let el of els) {
    el.onfocus = function () {
      this.onkeydown = e => changeHex(e)
      this.onwheel = e => changeHex(e)

      function changeHex (e) {
        if (e.keyCode === 38 || e.deltaY < 0) {
          let red = (cp.red >= 255) ? 255 : cp.red + 1
          let green = (cp.green >= 255) ? 255 : cp.green + 1
          let blue = (cp.blue >= 255) ? 255 : cp.blue + 1
          return cp.setNewRGBColor([red, green, blue])
        } else if (e.keyCode === 40 || e.deltaY > 0) {
          let red = (cp.red <= 0) ? 0 : cp.red - 1
          let green = (cp.green <= 0) ? 0 : cp.green - 1
          let blue = (cp.blue <= 0) ? 0 : cp.blue - 1
          return cp.setNewRGBColor([red, green, blue])
        }
      }
    }
  }
}
