'use client'

import React, { useEffect, useState } from 'react'

// Brand glyphs from simple-icons (CC0), inlined to avoid a dependency for four paths.
const BRANDS = {
  kakao:
    'M12 3.5c-5.25 0-9.5 3.3-9.5 7.37 0 2.62 1.76 4.92 4.4 6.22l-.94 3.45c-.08.3.26.55.52.37l4.12-2.72c.46.05.92.08 1.4.08 5.25 0 9.5-3.3 9.5-7.4S17.25 3.5 12 3.5z',
  threads:
    'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z',
  facebook:
    'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  naver: 'M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z',
}

// In-app browsers and unfocused windows refuse the clipboard API, so fall back to the old copy command.
async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = url
    area.style.position = 'fixed'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

function Brand({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg aria-hidden="true" fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d={path} />
    </svg>
  )
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={20}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={20}
    >
      {children}
    </svg>
  )
}

export function ShareBar({
  title,
  url,
  text,
  card = false,
}: {
  title: string
  url: string
  text?: string
  card?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => setCanShare(typeof navigator.share === 'function'), [])

  const copy = async () => {
    if (!(await copyLink(url))) {
      setNote('복사하지 못했습니다. 주소창의 주소를 복사해 주세요.')
      setTimeout(() => setNote(''), 5000)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = async () => {
    try {
      await navigator.share({ title, text, url })
    } catch {
      // The visitor closed the share sheet.
    }
  }

  // Only the URL goes out, so KakaoTalk draws its card from the page's OG tags. PC share sheets don't list KakaoTalk, so there the link is copied.
  const kakao = async () => {
    if (canShare && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ url })
      } catch {
        // The visitor closed the share sheet.
      }
      return
    }
    setNote(
      (await copyLink(url))
        ? '링크를 복사했습니다. 카카오톡 대화창에 붙여 넣으면 미리보기 카드로 보입니다.'
        : '복사하지 못했습니다. 주소창의 주소를 복사해 주세요.',
    )
    setTimeout(() => setNote(''), 5000)
  }

  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const targets = [
    {
      label: '스레드에 공유',
      path: BRANDS.threads,
      color: '#000',
      href: `https://www.threads.net/intent/post?text=${t}%20${u}`,
    },
    {
      label: '페이스북에 공유',
      path: BRANDS.facebook,
      color: '#1877f2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    { label: 'X에 공유', path: BRANDS.x, color: '#000', href: `https://x.com/intent/post?text=${t}&url=${u}` },
    {
      label: '네이버에 공유',
      path: BRANDS.naver,
      color: '#03c75a',
      size: 15,
      href: `https://share.naver.com/web/shareView?url=${u}&title=${t}`,
    },
  ]

  return (
    <div aria-label="이 글 공유하기" className={card ? 'share share--card' : 'share'} role="group">
      {card ? <span className="share__label">공유하기</span> : null}
      {canShare ? (
        <button
          aria-label="공유하기"
          className="share__icon"
          onClick={share}
          style={{ '--brand': 'var(--accent)' } as React.CSSProperties}
          title="공유하기"
          type="button"
        >
          <Line>
            <path d="M12 16V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
          </Line>
        </button>
      ) : null}
      <button
        aria-label="카카오톡으로 보내기"
        className="share__icon share__icon--kakao"
        onClick={kakao}
        title="카카오톡으로 보내기"
        type="button"
      >
        <Brand path={BRANDS.kakao} size={24} />
      </button>
      {targets.map((target) => (
        <a
          aria-label={target.label}
          className="share__icon"
          href={target.href}
          key={target.label}
          rel="noopener nofollow"
          style={{ '--brand': target.color } as React.CSSProperties}
          target="_blank"
          title={target.label}
        >
          <Brand path={target.path} size={target.size} />
        </a>
      ))}
      <button
        aria-label="링크 복사"
        className={copied ? 'share__icon share__icon--copy is-done' : 'share__icon share__icon--copy'}
        onClick={copy}
        title={copied ? '복사했습니다' : '링크 복사'}
        type="button"
      >
        <Line>
          {copied ? (
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          ) : (
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          )}
        </Line>
      </button>
      <span aria-live="polite" className={note ? 'share__note' : 'sr-only'}>
        {note || (copied ? '링크를 복사했습니다' : '')}
      </span>
    </div>
  )
}
