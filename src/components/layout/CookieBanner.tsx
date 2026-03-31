'use client'

import CookieConsent, { getCookieConsentValue, resetCookieConsentValue } from 'react-cookie-consent'

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      cookieName="neptune_cookie_consent"
      expires={365}
      enableDeclineButton
      declineButtonText="Refuser"
      buttonText="Accepter"
      onAccept={() => {
        // Analytics or tracking can be enabled here
      }}
      onDecline={() => {
        // Analytics or tracking should remain disabled
      }}
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e5e5e5',
        color: '#1a1a1a',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        padding: '1.25rem 2rem',
        alignItems: 'center',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}
      contentStyle={{
        margin: '0',
        flex: '1',
        maxWidth: '680px',
      }}
      buttonStyle={{
        background: '#1a1a1a',
        color: '#ffffff',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        padding: '0.6rem 1.4rem',
        border: 'none',
        cursor: 'pointer',
        margin: '0 0 0 0.5rem',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#1a1a1a',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        padding: '0.6rem 1.4rem',
        border: '1px solid #1a1a1a',
        cursor: 'pointer',
        margin: '0 0 0 0.5rem',
      }}
    >
      Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic.{' '}
      <a
        href="/politique-de-confidentialite"
        style={{
          color: '#8B2942',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        En savoir plus
      </a>
    </CookieConsent>
  )
}

export { getCookieConsentValue, resetCookieConsentValue }
