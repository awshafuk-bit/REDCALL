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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CONTACT_MESSAGE =
  'Enter a valid email address or mobile number. International numbers need the country code, for example +44 7700 900123.'

/* The contact field takes an email OR a mobile number. Returns 'email', 'mobile' or null. */
function classifyContact(raw) {
  const value = raw.trim()
  if (value.includes('@')) return EMAIL_RE.test(value) ? 'email' : null
  const digits = value.replace(/[\s().-]/g, '')
  return /^\+?\d{7,15}$/.test(digits) ? 'mobile' : null
}

const demoForm = document.querySelector('[data-demo-form]')
if (demoForm) {
  const shell = document.querySelector('[data-form-shell]')
  const success = document.querySelector('[data-form-success]')
  const error = demoForm.querySelector('[data-form-error]')
  const submit = demoForm.querySelector('[data-form-submit]')
  const contact = demoForm.querySelector('[data-contact-input]')
  const submitLabel = submit.textContent

  const checkContact = () => {
    contact.setCustomValidity(classifyContact(contact.value) ? '' : CONTACT_MESSAGE)
  }
  contact.addEventListener('input', checkContact)
  checkContact()

  demoForm.addEventListener('submit', async (event) => {
    checkContact()
    if (!demoForm.checkValidity()) return

    event.preventDefault()
    error.hidden = true
    submit.disabled = true
    submit.textContent = 'Sending...'

    const body = new FormData(demoForm)
    const kind = classifyContact(contact.value)
    body.set('contact', contact.value.trim())
    body.set('contact_type', kind)
    /* FormSubmit uses a field named "email" as the reply-to address. */
    if (kind === 'email') body.set('email', contact.value.trim())

    try {
      const response = await fetch(demoForm.action.replace('/formsubmit.co/', '/formsubmit.co/ajax/'), {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Request failed with ${response.status}`)
      /* FormSubmit can answer 200 with success:"false" (for example an unactivated address). */
      const result = await response.json().catch(() => ({}))
      if (result.success === false || result.success === 'false') {
        throw new Error(result.message || 'FormSubmit rejected the submission')
      }

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
