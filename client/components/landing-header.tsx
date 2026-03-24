'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/config'

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="w-full border-b bg-background">
      <nav className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h4 className="text-lg font-semibold">{siteConfig.name}</h4>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-primary">Home</Link>
          <Link href="/about" className="text-sm hover:text-primary">About</Link>
          <Link href="/#contact-us" className="text-sm hover:text-primary">Contact Us</Link>
          <Link href="/pricing" className="text-sm hover:text-primary">Pricing</Link>
          <Link href="/auth/register">
            <Button>Get Started</Button>
          </Link>
        </div>
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 flex flex-col gap-4">
          <Link href="/" className="text-sm">Home</Link>
          <Link href="/about" className="text-sm">About</Link>
          <Link href="/#contact-us" className="text-sm">Contact Us</Link>
          <Link href="/pricing" className="text-sm">Pricing</Link>
          <Link href="/auth/register">
            <Button className="w-full">Get Started</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
