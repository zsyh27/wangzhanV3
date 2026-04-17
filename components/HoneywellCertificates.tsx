'use client'

import { useState } from 'react'
import ImageModal from './ImageModal'

export default function HoneywellCertificates() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState({
    src: '',
    alt: ''
  })

  const openModal = (src: string, alt: string) => {
    setSelectedImage({ src, alt })
    setModalOpen(true)
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
          <div className="w-full h-64 flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src="/images/about/霍尼韦尔资质.png" 
              alt="霍尼韦尔授权代理商证书" 
              className="max-w-full max-h-full object-contain cursor-pointer" 
              onClick={() => openModal('/images/about/霍尼韦尔资质.png', '霍尼韦尔授权代理商证书')} 
            />
          </div>
          <p className="text-text font-medium">霍尼韦尔阀门湖北授权代理商</p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
          <div className="w-full h-64 flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src="/images/about/霍尼韦尔楼宇自动化施工能力.jpg" 
              alt="霍尼韦尔楼宇自动化施工能力" 
              className="max-w-full max-h-full object-contain cursor-pointer" 
              onClick={() => openModal('/images/about/霍尼韦尔楼宇自动化施工能力.jpg', '霍尼韦尔楼宇自动化施工能力')} 
            />
          </div>
          <p className="text-text font-medium">霍尼韦尔楼宇自动化施工能力证书</p>
        </div>
      </div>
      <ImageModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        imageSrc={selectedImage.src} 
        imageAlt={selectedImage.alt} 
      />
    </>
  )
}