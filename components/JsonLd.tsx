'use client'

import { useEffect } from 'react'

interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * JSON-LD结构化数据组件
 * SEO优化：百度搜索资源平台结构化数据规范
 */
export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const existingScript = document.querySelector('script[type="application/ld+json"]#jsonld-dynamic')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.id = 'jsonld-dynamic'
    script.type = 'application/ld+json'
    script.innerHTML = JSON.stringify(data)
    document.body.appendChild(script)

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]#jsonld-dynamic')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data])

  return null
}
