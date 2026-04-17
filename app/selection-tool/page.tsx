'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { trackSelectionTool, trackProductView, useBaiduAnalytics } from '@/lib/baidu-analytics'

interface Product {
  model: string
  sizeRange: string
  connection: string
  control: string
  media: string
  slug: string
}

const products: Product[] = [
  {
    model: 'V5011B2W',
    sizeRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    media: 'cold-hot-water',
    slug: 'v5011b2w'
  },
  {
    model: 'V5011S2W',
    sizeRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    media: 'cold-hot-water',
    slug: 'v5011s2w'
  },
  {
    model: 'V5011S2S',
    sizeRange: 'DN15-DN50',
    connection: 'thread',
    control: 'modulating',
    media: 'steam',
    slug: 'v5011s2s'
  },
  {
    model: 'V5GV2W',
    sizeRange: 'DN15-DN150',
    connection: 'flange',
    control: 'modulating',
    media: 'cold-hot-water',
    slug: 'v5gv2w'
  },
  {
    model: 'V5GV2S',
    sizeRange: 'DN15-DN150',
    connection: 'flange',
    control: 'modulating',
    media: 'steam',
    slug: 'v5gv2s'
  },
  {
    model: 'V6GV',
    sizeRange: 'DN15-DN250',
    connection: 'flange',
    control: 'modulating',
    media: 'cold-hot-water',
    slug: 'v6gv'
  },
  {
    model: 'VBA16P',
    sizeRange: 'DN15-DN100',
    connection: 'thread',
    control: 'both',
    media: 'cold-hot-water',
    slug: 'vba16p'
  },
  {
    model: 'VBF16E',
    sizeRange: 'DN15-DN150',
    connection: 'flange',
    control: 'both',
    media: 'cold-hot-water',
    slug: 'vbf16e-vbh16e'
  },
  {
    model: 'V9BF',
    sizeRange: 'DN50-DN600',
    connection: 'flange',
    control: 'both',
    media: 'both',
    slug: 'v9bf'
  },
  {
    model: 'VH58',
    sizeRange: 'DN65-DN250',
    connection: 'flange',
    control: 'modulating',
    media: 'cold-hot-water',
    slug: 'vh58'
  }
]

const sizeOptions = [
  'DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50',
  'DN65', 'DN80', 'DN100', 'DN125', 'DN150'
]

const getSizeRange = (size: string) => {
  return parseInt(size.replace('DN', ''))
}

const isSizeInRange = (productSizeRange: string, selectedSize: string) => {
  if (!selectedSize) return true
  const [min, max] = productSizeRange.split('-').map(getSizeRange)
  const target = getSizeRange(selectedSize)
  return target >= min && target <= max
}

export default function SelectionToolPage() {
  useBaiduAnalytics('在线选型工具')

  const [media, setMedia] = useState('')
  const [size, setSize] = useState('')
  const [connection, setConnection] = useState('')
  const [control, setControl] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  const handleSelectionStart = () => {
    trackSelectionTool('开始选型')
    
    const filtered = products.filter(product => {
      let match = true
      
      if (media && product.media !== 'both') {
        if (product.media !== media) {
          match = false
        }
      }
      
      if (size && !isSizeInRange(product.sizeRange, size)) {
        match = false
      }
      
      if (connection && product.connection !== connection) {
        match = false
      }
      
      if (control && product.control !== 'both') {
        if (product.control !== control) {
          match = false
        }
      }
      
      return match
    })
    
    setFilteredProducts(filtered)
    setShowResults(true)
  }

  const handleProductClick = (productName: string) => {
    trackProductView(productName)
  }

  const getMediaLabel = (media: string) => {
    switch (media) {
      case 'cold-hot-water': return '冷热水'
      case 'steam': return '蒸汽'
      case 'both': return '冷热水/蒸汽'
      default: return ''
    }
  }

  const getConnectionLabel = (connection: string) => {
    switch (connection) {
      case 'thread': return '螺纹'
      case 'flange': return '法兰'
      default: return ''
    }
  }

  const getControlLabel = (control: string) => {
    switch (control) {
      case 'on-off': return '开关'
      case 'modulating': return '调节'
      case 'both': return '开关/调节'
      default: return ''
    }
  }

  const resetForm = () => {
    setMedia('')
    setSize('')
    setConnection('')
    setControl('')
    setShowResults(false)
  }

  return (
    <>
      <Navbar />
      
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-6 text-center">
              霍尼韦尔阀门在线选型工具
            </h1>
            <p className="text-text-secondary text-lg text-center max-w-3xl mx-auto">
              根据您的工况条件，快速找到适合的霍尼韦尔阀门型号
            </p>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl text-text mb-8 text-center">
              选型条件
            </h2>
            
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-text font-medium mb-2">工况介质</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                    value={media}
                    onChange={(e) => setMedia(e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="cold-hot-water">冷热水</option>
                    <option value="steam">蒸汽</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text font-medium mb-2">阀门口径</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <option value="">请选择</option>
                    {sizeOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text font-medium mb-2">连接方式</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                    value={connection}
                    onChange={(e) => setConnection(e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="thread">螺纹连接</option>
                    <option value="flange">法兰连接</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text font-medium mb-2">控制方式</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-background text-text"
                    value={control}
                    onChange={(e) => setControl(e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="on-off">开关控制</option>
                    <option value="modulating">调节控制</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 text-center flex gap-4 justify-center">
                <button 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer"
                  onClick={handleSelectionStart}
                >
                  开始选型
                </button>
                <button 
                  className="bg-gray-100 hover:bg-gray-200 text-text px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer"
                  onClick={resetForm}
                >
                  重置
                </button>
              </div>

              {showResults && (
                <div className="mt-8">
                  <h3 className="font-heading font-semibold text-xl text-text mb-6 text-center">
                    选型结果 ({filteredProducts.length} 个产品)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-xl border border-gray-100">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-6 py-4 text-left font-semibold text-text">产品型号</th>
                          <th className="px-6 py-4 text-left font-semibold text-text">口径范围</th>
                          <th className="px-6 py-4 text-left font-semibold text-text">连接方式</th>
                          <th className="px-6 py-4 text-left font-semibold text-text">控制方式</th>
                          <th className="px-6 py-4 text-left font-semibold text-text">适用介质</th>
                          <th className="px-6 py-4 text-left font-semibold text-text">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <tr key={product.model}>
                              <td className="px-6 py-4 text-text font-medium">{product.model}</td>
                              <td className="px-6 py-4 text-text-secondary">{product.sizeRange}</td>
                              <td className="px-6 py-4 text-text-secondary">{getConnectionLabel(product.connection)}</td>
                              <td className="px-6 py-4 text-text-secondary">{getControlLabel(product.control)}</td>
                              <td className="px-6 py-4 text-text-secondary">{getMediaLabel(product.media)}</td>
                              <td className="px-6 py-4">
                                <Link 
                                  href={`/products/${product.slug}`}
                                  className="text-primary hover:underline cursor-pointer"
                                  onClick={() => handleProductClick(product.model)}
                                >
                                  查看详情
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                              没有找到符合条件的产品，请尝试调整筛选条件
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading font-semibold text-2xl text-text mb-4">
              需要专业选型支持？
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              我们的技术工程师为您提供免费的阀门选型咨询服务
            </p>
            <Link 
              href="/contact"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 cursor-pointer inline-flex items-center"
              title="联系我们获取专业选型支持"
            >
              立即咨询
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
