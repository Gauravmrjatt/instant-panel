'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from "sonner";
import {
  Wallet,
  Send,
  IndianRupee,
  Phone,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Info,
  RefreshCw,
  DollarSign,
  Zap,
  CreditCard,
} from 'lucide-react'

export default function PayToUserPage() {
  const [formData, setFormData] = useState({
    user: '',
    amount: '',
    comment: ''
  })
  const [isSuccess, setIsSuccess] = useState(false)

  const payMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await authFetch(`${apiConfig.baseUrl}/pay/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pay: data })
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success(data.msg || 'Payment successful!')
        setIsSuccess(true)
        setFormData({ user: '', amount: '', comment: '' })
        setTimeout(() => setIsSuccess(false), 3000)
      } else {
        toast.error(data.msg || 'Payment failed')
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user) {
      toast.error('Please enter a phone number')
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    toast.promise(
      payMutation.mutateAsync(formData),
      {
        loading: 'Processing payment...',
        success: (data) => data.msg || 'Payment successful!',
        error: (error) => error.message || 'Payment failed'
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const quickAmounts = [100, 500, 1000, 2000, 5000]
  const isFormValid = formData.user && formData.amount && parseFloat(formData.amount) > 0

  return (
    <div className="min-h-screen space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary shadow-lg">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pay to User</h1>
            <p className="text-muted-foreground">Send instant payments to users</p>
          </div>
        </div>
        <Button variant="outline" render={<Link href="/dashboard" />}>
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      {/* Quick Amounts Bar */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quick Amounts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={formData.amount === amt.toString() ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 "
                  onClick={() => setFormData(prev => ({ ...prev, amount: amt.toString() }))}
                >
                  ₹{amt.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Full Width */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Payment Form - Wider */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Send Payment</CardTitle>
                  <CardDescription>Transfer funds to a user via their phone number</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="p-6 rounded-full bg-primary/10">
                    <CheckCircle2 className="h-16 w-16 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-semibold text-primary">Payment Successful!</h3>
                    <p className="text-muted-foreground">The payment has been processed successfully</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        UPI Address <Badge variant="destructive" className="ml-1 h-5 text-[10px]">Required</Badge>
                      </Label>
                      <div className="relative">
                        <Input
                          name="user"
                          type="tel"
                          placeholder="Enter user's UPI address"
                          value={formData.user}
                          onChange={handleChange}
                          className="h-14 pl-12 text-lg font-mono"
                          
                        />
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Enter the user's registered phone number
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Amount <Badge variant="destructive" className="ml-1 h-5 text-[10px]">Required</Badge>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₹</span>
                        <Input
                          name="amount"
                          type="number"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleChange}
                          className="h-14 pl-12 text-2xl font-bold"
                          min="1"
                        />
                      </div>
                      {formData.amount && (
                        <p className="text-sm text-muted-foreground">
                          Amount: <span className="font-medium">₹{Number(formData.amount).toLocaleString('en-IN')}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comment <span className="text-muted-foreground text-sm ml-1">(optional)</span>
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="comment"
                        placeholder="Add a note for this payment"
                        value={formData.comment}
                        onChange={handleChange}
                        className="pl-12 h-12"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Payment will be processed immediately</span>
                    </div>
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={!isFormValid || payMutation.isPending}
                      className="w-full sm:w-auto gap-2"
                    >
                      {payMutation.isPending ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Pay ₹{formData.amount || '0'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Summary */}
          {formData.amount && formData.user && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Recipient</p>
                  <p className="font-mono font-medium">
                    {formData.user.slice(0, 3)}****{formData.user.slice(-2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-xl font-bold text-primary">₹{Number(formData.amount).toLocaleString()}</p>
                </div>
                {formData.comment && (
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground mb-1">Comment</p>
                    <p className="text-sm">{formData.comment}</p>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{Number(formData.amount).toLocaleString()}</span>
                </div>
                <Badge className="w-full justify-center py-2 bg-primary/10 text-primary border-primary/20">
                  Ready to send
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <IndianRupee className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">Instant</p>
                  <p className="text-xs text-muted-foreground">Transfer</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-chart-2/5">
                  <Zap className="h-5 w-5 mx-auto text-chart-2 mb-1" />
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                How it Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 1, title: 'Enter Phone', desc: 'User registered phone number' },
                { step: 2, title: 'Enter Amount', desc: 'Payment amount to transfer' },
                { step: 3, title: 'Add Comment', desc: 'Optional note for reference' },
                { step: 4, title: 'Payment Sent', desc: 'Funds transferred instantly', highlight: true },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.step}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${item.highlight ? 'text-primary' : ''}`}>{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/payments" />}>
                View Payment History
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/pending" />}>
                Pending Approvals
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/customAmount" />}>
                Custom Amount
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
