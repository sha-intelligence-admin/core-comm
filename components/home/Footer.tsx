import { Arrow } from '@radix-ui/react-tooltip'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Footer = () => {

    const [email, setEmail] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [message, setMessage] = React.useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const handleSubscribe = async () => {
        if (!email) {
            setMessage({ type: 'error', text: 'Please enter an email address' })
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const result = await response.json()

            setMessage({
                type: result.success ? 'success' : 'error',
                text: result.message,
            })

            if (result.success) {
                setEmail('') // Clear input on success
            }
        } catch (error) {
            console.error('Subscription error:', error)
            setMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please try again.',
            })
        } finally {
            setIsLoading(false)

            // Auto-clear message after 5 seconds
            setTimeout(() => setMessage(null), 5000)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubscribe()
        }
    }

    return (
        <div className='bg-deepBlue p-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto'>
                <div className='flex flex-col space-y-4'>
                    <div>
                        <h1 className='text-gray-400'>Product</h1>
                        <ul>
                            <li>
                                <a href="/" className='text-white hover:text-aquaGlow'>Overview</a>
                            </li>
                            <li>
                                <a href="/integration" className='text-white hover:text-aquaGlow'>Integrations</a>
                            </li>
                            <li>
                                <a href="/pricing" className='text-white hover:text-aquaGlow'>Pricing</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='flex flex-col space-y-4'>
                    <div>
                        <h1 className='text-gray-400'>Company</h1>
                        <ul>
                            <li>
                                <a href="/about" className='text-white hover:text-aquaGlow'>About Us</a>
                            </li>
                            <li>
                                <a href="/contact" className='text-white hover:text-aquaGlow'>Contact</a>
                            </li>
                            {/* <li>
                                <a href="#" className='text-white hover:text-aquaGlow'>Blog</a>
                            </li>
                            <li>
                                <a href="#" className='text-white hover:text-aquaGlow'>Press</a>
                            </li> */}
                        </ul>
                    </div>
                </div>
                <div className='flex flex-col space-y-4'>
                    <div>
                        <h1 className='text-gray-400'>Resources</h1>
                        <ul>
                            <li>
                                <a href="/documentation" className='text-white hover:text-aquaGlow'>Documentation</a>
                            </li>
                            <li>
                                <a href="/documentation?section=api-reference" className='text-white hover:text-aquaGlow'>API Reference</a>
                            </li>
                            <li>
                                <a href="/help" className='text-white hover:text-aquaGlow'>Help Center</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='flex flex-col space-y-4'>
                    <div>
                        <h1 className='text-gray-400'>Security & Legal</h1>
                        <ul>
                            <li>
                                <a href="#" className='text-white hover:text-aquaGlow'>Security</a>
                            </li>
                            <li>
                                <a href="#" className='text-white hover:text-aquaGlow'>Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" className='text-white hover:text-aquaGlow'>Terms of Service</a>
                            </li>
                            <li>
                                <a href="#" className='text-white hover:text-aquaGlow'>Compliance</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='border-t border-b border-gray-700 mt-8 py-8 items-center justify-center w-full flex space-x-20 md:space-x-40'>
                <Link href="https://x.com/sha_intell">
                    <img src="twitter.png" alt="" className='size-10' />
                </Link>
                <Link href="https://www.instagram.com/sha_intell">
                    <img src="instagram.png" alt="" className='size-10' />
                </Link>
                <Link href="https://www.linkedin.com/company/sha-intelligence/">
                    <img src="linkedin.png" alt="" className='size-10' />
                </Link>
            </div>
            <div className='hidden lg:flex border-b border-gray-700 space-y-8 md:space-y-0 md:space-x-20 items-center justify-center w-full px-4 mt-8'>
                <div className='flex flex-1 space-x-10 items-center justify-center'>
                    <img src="logo.png" alt="" className='w-20' />
                    <h1 className='text-electricBlue font-bold text-6xl'>CoreComm</h1>
                </div>
                <div className='flex-1 py-8 items-center justify-center w-full flex flex-col'>
                    <div className='w-full text-start'>
                        <h1 className='text-gray-400'>Subscribe to our Newsletter</h1>
                    </div>
                    <div className='mt-4 w-full'>
                        <div className='bg-white p-1 pl-4 border rounded-full focus:outline-none w-full flex justify-between'>
                            <input type="email" id='newsletter' placeholder='Business Email Address' className='bg-transparent border-none outline-none text-black w-full' value={email} onChange={(e) => setEmail(e.target.value)} />
                            <button
                                onClick={handleSubscribe}
                                className='group bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white pl-4 py-1 pr-1 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl'>
                                Subscribe
                                <div className='group-hover:text-white flex items-center justify-center rounded-full bg-deepBlue p-2 transition-colors duration-200'>
                                    <ArrowUpRight />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex lg:hidden py-8 border-b border-gray-700 flex-col space-y-8 md:space-x-20 items-center justify-center w-full px-4 mt-8'>
                <div className='flex-1 items-center justify-center w-full flex flex-col'>
                    <div className='w-full text-start'>
                        <h1 className='text-gray-400'>Subscribe to our Newsletter</h1>
                    </div>
                    <div className='mt-4 w-full'>
                        <div className='bg-white p-1 pl-4 border rounded-full focus:outline-none w-full flex justify-between'>
                            <input type="email" id='newsletter' placeholder='Business Email Address' className='w-full bg-transparent border-none outline-none text-black' value={email} onChange={(e) => setEmail(e.target.value)} />
                            <button
                                onClick={handleSubscribe}
                                className='group hidden sm:flex bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white pl-4 py-1 pr-1 rounded-full font-medium transition-all duration-200 items-center gap-2 shadow-lg hover:shadow-xl'>
                                Subscribe
                                <div className='group-hover:text-white flex items-center justify-center rounded-full bg-deepBlue p-2 transition-colors duration-200'>
                                    <ArrowUpRight />
                                </div>
                            </button>
                            <button
                                onClick={handleSubscribe}
                                className='flex sm:hidden bg-transparent hover:bg-aquaGlow hover:text-deepBlue text-white rounded-full font-medium transition-all duration-200 items-center gap-2 shadow-lg hover:shadow-xl'>
                                <div className='flex items-center justify-center rounded-full bg-deepBlue p-2 transition-colors duration-200'>
                                    <ArrowUpRight />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <div className='flex flex-1 space-x-10 items-center justify-center'>
                    <img src="logo.png" alt="" className='w-20' />
                    <h1 className='text-electricBlue font-bold text-4xl sm:text-6xl'>CoreComm</h1>
                </div>

            </div>
            <div className='mt-8 w-full flex items-center justify-center'>
                <p className='text-gray-400'>© 2025 CoreComm. All rights reserved.</p>
            </div>

        </div>
    )
}

export default Footer