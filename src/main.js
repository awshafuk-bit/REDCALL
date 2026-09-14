const navToggle = document.querySelector('[data-nav-toggle]')
const nav = document.querySelector('[data-nav-menu]')

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.getAttribute('data-open') === 'true'
    nav.setAttribute('data-open', String(!isOpen))
    navToggle.setAttribute('aria-expanded', String(!isOpen))
  })
}

const shaderBackgroundEls = document.querySelectorAll('[data-shader-bg]')
if (shaderBackgroundEls.length > 0) {
  import('./shader-background.js').then(({ mountShaderBackground }) => {
    shaderBackgroundEls.forEach((el) => mountShaderBackground(el))
  })
}

/* Demo form: post in the background and confirm in place, so the visitor stays on the page.
   Without JS the form still submits normally to the same endpoint. */
const demoForm = document.querySelector('[data-demo-form]')
if (demoForm) {
  const shell = document.querySelector('[data-form-shell]')
  const success = document.querySelector('[data-form-success]')
  const error = demoForm.querySelector('[data-form-error]')
  const submit = demoForm.querySelector('[data-form-submit]')
  const submitLabel = submit.textContent

  demoForm.addEventListener('submit', async (event) => {
    if (!demoForm.checkValidity()) return

    event.preventDefault()
    error.hidden = true
    submit.disabled = true
    submit.textContent = 'Sending...'

    try {
      const response = await fetch(demoForm.action.replace('/formsubmit.co/', '/formsubmit.co/ajax/'), {
        method: 'POST',
        body: new FormData(demoForm),
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Request failed with ${response.status}`)

      shell.hidden = true
      success.hidden = false
      success.focus()
    } catch {
      error.hidden = false
      submit.disabled = false
      submit.textContent = submitLabel
    }
  })
}
