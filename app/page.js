'use client'
import React from 'react'
import dynamic from 'next/dynamic'

const Os = dynamic(() => import('./Boot'), {
  ssr: false
})

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden ">
      <Os/>
    </main>
  )
}