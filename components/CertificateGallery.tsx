'use client'

import { useState } from 'react'
import ImageModal from './ImageModal'

interface Certificate {
  src: string
  alt: string
  title: string
}

interface CertificateGalleryProps {
  certificates: Certificate[]
}

export default function CertificateGallery({ certificates }: CertificateGalleryProps) {
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((certificate, index) => (
        <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
          <div className="w-full h-48 flex items-center justify-center overflow-hidden">
            <img 
              src={certificate.src} 
              alt={certificate.alt} 
              className="max-w-full max-h-full object-contain cursor-pointer" 
              onClick={() => openModal(certificate.src, certificate.alt)} 
            />
          </div>
        </div>
      ))}
      <ImageModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        imageSrc={selectedImage.src} 
        imageAlt={selectedImage.alt} 
      />
    </div>
  )
}
