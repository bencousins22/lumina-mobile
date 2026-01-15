import React, { useRef, useEffect, useCallback, useState } from 'react'

type Props = {
  src?: string
  projectId?: string
  conversationId?: string
  onMessage?: (msg: any) => void
  className?: string
  style?: React.CSSProperties
}

export default function LegacyChatWrapper({
  src = '/legacy/index.html',
  projectId,
  conversationId,
  onMessage,
  className,
  style,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!iframeRef.current) return
      if (e.source !== iframeRef.current.contentWindow) return
      const data = e.data || {}
      const { type, payload } = data
      if (type === 'legacy-ready') setReady(true)
      if (type === 'message-created' && onMessage) onMessage(payload)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onMessage])

  const post = useCallback(
    (type: string, payload?: any) => {
      const win = iframeRef.current?.contentWindow
      if (!win) return
      win.postMessage({ type, payload, meta: { projectId, conversationId } }, '*')
    },
    [projectId, conversationId]
  )

  useEffect(() => {
    if (!ready) return
    post('init', { projectId, conversationId })
  }, [ready, post, projectId, conversationId])

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', ...style }}>
      <iframe
        ref={iframeRef}
        src={src}
        title="Legacy Chat"
        style={{ border: 0, flex: 1, width: '100%', minHeight: 200 }}
      />
      <div style={{ padding: 8, fontSize: 12, color: '#666' }}>Legacy chat status: {ready ? 'ready' : 'loading'}</div>
    </div>
  )
}
