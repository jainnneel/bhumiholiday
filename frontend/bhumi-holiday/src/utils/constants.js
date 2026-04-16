/**
 * Centralised brand constants — update here, applies everywhere.
 */

export const BRAND = {
  name:        'Bhumi Holiday',
  phone:       '8980345600',          // display format
  phoneIntl:   '+91 89803 45600',     // display with country code
  phoneTel:    'tel:+918980345600',   // href for click-to-call
  waNumber:    '918980345600',        // wa.me format (no +)
  waBase:      'https://wa.me/918980345600',
  email:       'info@bhumiholidays.in',
  emailHref:   'mailto:info@bhumiholidays.in',
  address:     'Ahmedabad, Gujarat, India',
}

/** Build a wa.me link with a pre-filled message */
export function waLink(message = '') {
  if (!message) return `https://wa.me/${BRAND.waNumber}`
  return `https://wa.me/${BRAND.waNumber}?text=${encodeURIComponent(message)}`
}

/** Default domestic inquiry text */
export const WA_MSG_DOMESTIC = 'Hi Bhumi Holiday, I need help with a domestic flight booking.'

/** Default international inquiry text */
export const WA_MSG_INTERNATIONAL = 'Hi Bhumi Holiday, I want to inquire about *international flights*. Please share available options.'

/** Default general inquiry */
export const WA_MSG_GENERAL = 'Hi Bhumi Holiday, I have a query regarding my travel.'
