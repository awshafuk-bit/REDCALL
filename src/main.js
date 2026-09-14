const navToggle = document.querySelector('[data-nav-toggle]')
const nav = document.querySelector('[data-nav-menu]')

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.getAttribute('data-open') === 'true'
    nav.setAttribute('data-open', String(!isOpen))
    navToggle.setAttribute('aria-expanded', String(!isOpen))
  })
}

const shaderBackgroundEl = document.querySelector('[data-shader-bg]')
if (shaderBackgroundEl) {
  import('./shader-background.js').then(({ mountShaderBackground }) => {
    mountShaderBackground(shaderBackgroundEl)
  })
}
