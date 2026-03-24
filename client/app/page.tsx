'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { siteConfig } from '@/lib/config'
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Users,
  CreditCard,
  HeadphonesIcon,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Star,
} from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Get paid instantly with our lightning-fast payment processing system. No delays, no waiting.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Bank-grade security with end-to-end encryption. Your data and payments are always protected.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track your campaigns with detailed analytics and reporting. Make data-driven decisions.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Our dedicated support team is available around the clock to help you succeed.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Users,
    title: 'Easy Integration',
    description: 'Simple API integration with clear documentation. Get started in minutes.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payment Methods',
    description: 'Accept payments via UPI, Paytm, Bank Transfer, and more. Maximum flexibility for your users.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
]

const stats = [
  { value: '10Cr+', label: 'Clicks Registered' },
  { value: '1Cr+', label: 'Leads Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
]

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Campaign Manager',
    content: 'This platform has transformed how we handle payments. Fast, secure, and incredibly reliable.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Affiliate Partner',
    content: 'The instant payment feature is a game changer. No more waiting for payments to process.',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Tech Entrepreneur',
    content: 'Best integration experience ever. The API documentation is crystal clear and support is amazing.',
    rating: 5,
  },
]

const faqs = [
  {
    question: 'What is the Instant Payment Panel?',
    answer: 'The Instant Payment Panel is a user-friendly platform that facilitates quick and secure payment processing. It empowers campaign makers to receive instant payments for their products, services, or campaigns, ensuring a seamless and efficient payment experience.',
  },
  {
    question: 'Is the Instant Payment Panel secure?',
    answer: 'Absolutely! We take security seriously and implement robust encryption and data protection measures. Our platform complies with industry standards to ensure that all payment transactions are secure and safeguarded against unauthorized access.',
  },
  {
    question: 'How do I integrate the panel with my website?',
    answer: 'Integrating the Instant Payment Panel with your website or campaign is a straightforward process. We provide clear documentation and APIs to guide you through the integration. Additionally, our support team is available to assist you if needed.',
  },
  {
    question: 'What kind of reporting is available?',
    answer: 'We offer comprehensive reporting and analytics tools that provide valuable insights into your payment data. You can track transaction history, monitor sales performance, and generate reports to make data-driven decisions.',
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'We believe in transparent pricing. There are no hidden costs, and our pricing structure is straightforward. You can find detailed information on our pricing plans on our website.',
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Stats
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background">
            <nav className="flex flex-col gap-4">
              <Link href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#stats" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Stats</Link>
              <Link href="#faq" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link href="#contact" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link href="/auth/login"><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link href="/dashboard"><Button className="w-full gap-2">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
            <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500" />
            Trusted by 50,000+ users across India
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            The Only Enterprise Platform Built for{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campaign Makers
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
            Get instant payments, real-time analytics, and seamless integration. 
            Start earning faster with our enterprise-grade platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8 h-12">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-12">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-16">
            <ChevronDown className="h-6 w-6 mx-auto text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need..
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features to help you manage your campaigns and payments efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground mb-8">
            Join thousands of campaign makers who trust us for their payment needs. 
            Start your free trial today.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="gap-2 text-lg px-10 h-14">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Find answers to common questions about our platform.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className={`overflow-hidden transition-all ${openFAQ === index ? 'ring-2 ring-primary/50' : ''}`}>
                <button
                  className="w-full p-6 text-left flex items-center justify-between"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 pt-0 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Contact</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Have questions? We are here to help.
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-6">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <HeadphonesIcon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground mb-4">
                  Our dedicated team is available around the clock.
                </p>
                <a href={`mailto:${siteConfig.help_mail}`}>
                  <Button variant="outline" className="gap-2">
                    {siteConfig.help_mail}
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36c-.16.48-.72.8-1.32.72-.56-.08-1.04-.48-1.16-.96-.24-.96-.88-1.68-1.84-2.08-.4-.16-.84-.16-1.24 0-.64.24-1.2.88-1.52 1.68-.12.28-.4.52-.72.6-.56.16-1.12-.16-1.28-.72l-.8-2.4c-.08-.24-.04-.52.12-.72l1.04-1.04c.48-.48 1.2-.48 1.68 0 .2.2.52.32.8.32.28 0 .56-.12.76-.32.8-.8 2.08-1.2 3.2-.88.48.16.84.6.88 1.12v2.16c0 .64.52 1.16 1.16 1.16.64 0 1.16-.52 1.16-1.16v-.96l.16.8c.08.56.6.92 1.12.84.56-.08.92-.6.84-1.16l-.4-2.56c-.08-.64-.44-1.2-1-1.56l-1.36-.96c-.48-.32-.56-.92-.24-1.36.32-.48.92-.56 1.36-.24l1.36.96c.8.56 1.32 1.44 1.36 2.4l.32 2.48c.08.64-.36 1.24-1 1.32-.64.08-1.24-.36-1.32-1l-.32-2.48c-.08-.64-.48-1.2-1.04-1.52l-2.08-1.2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Telegram</h3>
                <p className="text-muted-foreground mb-4">
                  Join our community for updates and support.
                </p>
                <a href={`https://t.me/${siteConfig.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    {siteConfig.telegram}
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold">{siteConfig.name}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. v.1.0.0
            </p>

            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground">
                Sign Up
              </Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
