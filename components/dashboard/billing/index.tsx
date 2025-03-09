"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import { FaPencilAlt, FaArrowDown, FaArrowUp, FaExclamation } from 'react-icons/fa';
import { Slider } from '@/components/ui/slider';
import { WalletTwoTone } from '@mui/icons-material';
import { HiSparkles } from 'react-icons/hi2';
import Link from 'next/link';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function BillingDashboard(props: Props) {
  const supabase = createClient();
  const [creditAmount, setCreditAmount] = useState(10);
  const [discount, setDiscount] = useState(0);

  // Calculate discount based on credit amount
  useEffect(() => {
    if (creditAmount >= 50000) {
      setDiscount(25);
    } else if (creditAmount >= 10000) {
      setDiscount(10);
    } else if (creditAmount >= 5000) {
      setDiscount(5);
    } else {
      setDiscount(0);
    }
  }, [creditAmount]);

  const calculateTotal = () => {
    const basePrice = creditAmount * 0.10; // 1 cent per credit
    return basePrice * (1 - discount/100);
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Credits & Billing"
      description="Manage your billing information and credits"
    >
      <div className="w-full mx-auto">
        <div className="flex flex-wrap -mx-3">
          <div className="w-full max-w-full px-3 mb-6 lg:mb-0 xl:flex-none">
            <div className="flex flex-wrap -mx-3">

              <div className="w-full max-w-full px-3 mb-6 xl:mb-0 xl:w-1/3 xl:flex-none">
                <div className="relative flex flex-col min-w-0 break-words bg-gradient-to-tl from-green-500 to-yellow-500 dark:to-transparent border-0 border-transparent border-solid shadow-xl rounded-2xl">
                  <div className="relative p-6">
                    <div className="text-black dark:text-white">
                      <h6 className="text-base font-medium uppercase tracking-wide">Current Plan</h6>
                      <div className="mt-4">
                        <h3 className="text-2xl font-bold">Starter Plan</h3>
                        <p className="text-sm opacity-80 mt-2">You are allowed to create: <br />- 1 AI Chatbot <br /> - up to 5 AI Employees</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-2xl font-bold">$97/month</span>
                        <button className="px-4 py-2 text-sm bg-white text-green-800 rounded-full hover:bg-opacity-90 font-bold">
                          Manage Subscription →
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-800 text-center text-sm rounded-b-xl">
                    <span className="text-black dark:text-white font-semibold">Got a question? Email us at:<Link href="mailto:info@dialwise.ai" className="text-green-800 dark:text-green-500"> info@dialwise.ai</Link></span>
                  </div>
                </div>
              </div>

              {/* <div className="w-full max-w-full px-3 mb-6 xl:mb-0 xl:w-1/4 xl:flex-none">
                <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 border-transparent border-solid shadow-xl rounded-2xl bg-clip-border">
                  <div className="relative overflow-hidden rounded-2xl" style={{backgroundImage: "url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/card-visa.jpg')"}}>
                    <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-zinc-800 to-zinc-700 opacity-80"></span>
                    <div className="relative z-10 flex-auto p-4 my-7">
                      <CreditCardTwoTone className="text-white text-2xl"/>
                      <h5 className="pb-2 my-7 text-2xl text-white">XXXX&nbsp;&nbsp;&nbsp;XXXX&nbsp;&nbsp;&nbsp;XXXX&nbsp;&nbsp;&nbsp;7852</h5>
                      <div className="flex">
                        <div className="flex">
                          <div className="mr-8">
                            <p className="mb-0 text-md leading-normal text-white/80">Card Holder</p>
                            <h6 className="mb-0 text-xl text-white">Jack Peterson</h6>
                          </div>
                          <div>
                            <p className="mb-0 text-md leading-normal text-white/80">Expires</p>
                            <h6 className="mb-0 text-xl text-white">11/22</h6>
                          </div>
                        </div>
                        <div className="flex items-end justify-end w-1/5 ml-auto">
                          <img className="h-6 w-16" src="/assets/logo/visa-w.png" alt="Visa" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}

              <div className="w-full max-w-full px-3 mb-6 lg:mb-0 xl:w-2/3 xl:flex-none">
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full max-w-full px-3 md:w-1/2 md:flex-none">
                    <div className="relative flex flex-col min-w-0 break-words bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm rounded-lg p-4">
                      <div className="p-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tl from-green-500 to-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-800">
                          <HiSparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h6 className="mb-1 text-lg font-semibold">AI Employees Limit</h6>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Your current AI Employees limit<br />(how many AI Employees are you allowed to create or use)</p>
                        <hr className="h-px my-4 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                        <h5 className="mt-4 text-2xl font-bold">1 / 5</h5>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-full px-3 mt-6 md:mt-0 md:w-1/2 md:flex-none">
                    <div className="relative flex flex-col min-w-0 break-words bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm rounded-lg p-4">
                      <div className="p-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tl from-green-500 to-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-800">
                          <WalletTwoTone className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h6 className="mb-1 text-lg font-semibold">Your Wallet</h6>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Your available credit balance <br />(each credit costs $0.10 and you have 1000 credits to start with)</p>
                        <hr className="h-px my-4 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                        <h5 className="mt-4 text-2xl font-bold">455 / 1,000</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="max-w-full px-3 mb-6 lg:mb-0 lg:w-full lg:flex-none">
                <div className="relative flex flex-col min-w-0 mt-6 break-words bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm rounded-lg">
                  <div className="p-4 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                    <div className="flex flex-wrap -mx-3">
                      <div className="flex items-center flex-none w-1/2 max-w-full px-3">
                        <h6 className="mb-0">Payment Method</h6>
                      </div>
                      <div className="flex-none w-1/2 max-w-full px-3 text-right">
                        <button className="inline-block px-5 py-2.5 font-bold leading-normal text-center text-white align-middle transition-all bg-gradient-to-tl from-zinc-800 to-zinc-700 rounded-lg cursor-pointer text-sm ease-in shadow-md hover:shadow-xs active:opacity-85 hover:-translate-y-px tracking-tight-rem">
                          <span className="mr-2">+</span>Add New Card
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-auto p-4">
                    <div className="flex flex-wrap -mx-3">
                      <div className="max-w-full px-3 mb-6 md:mb-0 md:w-1/2 md:flex-none">
                        <div className="relative flex flex-row items-center flex-auto min-w-0 p-6 break-words bg-transparent border border-[hsl(var(--border))] rounded-xl">
                          <img className="mb-0 mr-4 w-1/10" src="/mastercard.png" alt="mastercard" />
                          <h6 className="mb-0">****&nbsp;&nbsp;&nbsp;****&nbsp;&nbsp;&nbsp;****&nbsp;&nbsp;&nbsp;7852</h6>
                          <FaPencilAlt className="ml-auto cursor-pointer text-[hsl(var(--muted-foreground))]" />
                        </div>
                      </div>
                      <div className="max-w-full px-3 md:w-1/2 md:flex-none">
                        <div className="relative flex flex-row items-center flex-auto min-w-0 p-6 break-words bg-transparent border border-[hsl(var(--border))] rounded-xl">
                          <img className="mb-0 mr-4 w-1/10" src="/visa.png" alt="visa" />
                          <h6 className="mb-0">****&nbsp;&nbsp;&nbsp;****&nbsp;&nbsp;&nbsp;****&nbsp;&nbsp;&nbsp;5248</h6>
                          <FaPencilAlt className="ml-auto cursor-pointer text-[hsl(var(--muted-foreground))]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Credit Packages Section */}
        <div className='w-full my-6 mx-auto'>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
              
              {/* Credit Slider */}
              <div className="mb-8">
                <h3 className="text-lg mb-4">Custom Amount</h3>
                <Slider
                  value={[creditAmount]}
                  onValueChange={(value) => setCreditAmount(value[0])}
                  min={10}
                  max={100000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-xl font-bold">{creditAmount.toLocaleString()} Credits</p>
                    {discount > 0 && (
                      <p className="text-green-500">-{discount}% Bulk Discount</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${calculateTotal().toFixed(2)}</p>
                    <button className="px-8 py-2 mt-4 text-md font-bold leading-normal text-center text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in bg-transparent border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
                      Purchase Credits
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Packages */}
              <div className='-mt-6'>
                <h3 className="text-lg mb-4">Popular Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-[hsl(var(--border))] rounded-lg p-4 text-center bg-gradient-to-tl from-green-500/10 to-zinc-500/10">
                    <h4 className="text-xl font-bold">Starter</h4>
                    <p className="text-3xl font-bold my-4">1,000 Credits</p>
                    <p className="text-[hsl(var(--muted-foreground))] mb-4">Perfect for small projects</p>
                    <button className="w-full px-8 py-2 mt-4 text-md font-bold leading-normal text-center text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in bg-transparent border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
                      Buy for $100
                    </button>
                  </div>
                  
                  <div className="border border-[hsl(var(--border))] rounded-lg p-4 text-center bg-gradient-to-tl from-green-500/10 to-zinc-500/10">
                    <h4 className="text-xl font-bold">Professional</h4>
                    <p className="text-3xl font-bold my-4">10,000 Credits</p>
                    <p className="text-[hsl(var(--muted-foreground))] mb-4">10% discount included</p>
                    <button className="w-full px-8 py-2 mt-4 text-md font-bold leading-normal text-center text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in bg-transparent border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
                      Buy for $900
                    </button>
                  </div>

                  <div className="border border-[hsl(var(--border))] rounded-lg p-4 text-center bg-gradient-to-tl from-green-500/10 to-zinc-500/10">
                    <h4 className="text-xl font-bold">Enterprise</h4>
                    <p className="text-3xl font-bold my-4">50,000 Credits</p>
                    <p className="text-[hsl(var(--muted-foreground))] mb-4">25% discount included</p>
                    <button className="w-full px-8 py-2 mt-4 text-md font-bold leading-normal text-center text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in bg-transparent border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
                      Buy for $3,749
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3">
          <div className="w-full max-w-full px-3 md:w-2/3 md:flex-none">
            <div className="relative flex flex-col min-w-0 break-words bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm rounded-lg">
              <div className="p-6 px-4 pb-0 mb-0 border-b-0 rounded-t-2xl">
                <h6 className="mb-0">Billing Information</h6>
              </div>
              <div className="flex-auto p-4 pt-6">
                <ul className="flex flex-col pl-0 mb-0 rounded-lg">
                  <li className="relative flex p-6 mb-2 border-0 rounded-t-inherit rounded-xl bg-gradient-to-tl from-green-500/10 to-zinc-500/10">
                    <div className="flex flex-col">
                      <h6 className="mb-4 text-sm leading-normal">Oliver Liam</h6>
                      <span className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">Company Name: <span className="font-semibold sm:ml-2">Viking Burrito</span></span>
                      <span className="mb-2 text-xs text-[hsl(var(--muted-foreground))]">Email Address: <span className="font-semibold sm:ml-2">oliver@burrito.com</span></span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">VAT Number: <span className="font-semibold sm:ml-2">FRB1235476</span></span>
                    </div>
                    <div className="ml-auto text-right">
                      <button className="relative z-10 inline-block px-4 py-2.5 mb-0 font-bold text-center text-transparent align-middle transition-all border-0 rounded-lg shadow-none cursor-pointer leading-normal text-sm ease-in bg-150 bg-gradient-to-tl from-red-600 to-orange-600 hover:-translate-y-px active:opacity-85 bg-x-25 bg-clip-text">
                        <FaArrowDown className="mr-2 text-red-500" /> Delete
                      </button>
                      <button className="inline-block px-4 py-2.5 mb-0 font-bold text-center align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-normal text-sm ease-in bg-150 hover:-translate-y-px active:opacity-85 bg-x-25 text-[hsl(var(--muted-foreground))]">
                        <FaPencilAlt className="mr-2" /> Edit
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full md:py-0 py-6 px-3 lg:w-1/3 lg:flex-none">
            <div className="relative flex flex-col h-full min-w-0 break-words bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm rounded-lg">
              <div className="p-4 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                <div className="flex flex-wrap -mx-3">
                  <div className="flex items-center flex-none w-1/2 max-w-full px-3">
                    <h6 className="mb-0">Invoices</h6>
                  </div>
                  <div className="flex-none w-1/2 max-w-full px-3 text-right">
                    <button className="inline-block px-8 py-2 mb-0 text-xs font-bold leading-normal text-center text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in bg-transparent border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
                      View All
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-auto p-4 pb-0">
                <ul className="flex flex-col pl-0 mb-0 rounded-lg">
                  <li className="relative flex justify-between px-4 py-2 pl-0 mb-2 border-0 rounded-t-inherit text-inherit rounded-xl">
                    <div className="flex flex-col">
                      <h6 className="mb-1 text-sm font-semibold">March, 01, 2020</h6>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">#MS-415646</span>
                    </div>
                    <div className="flex items-center text-sm">
                      $180
                      <button className="inline-block px-0 py-2.5 mb-0 ml-6 font-bold leading-normal text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer ease-in text-sm active:opacity-85 hover:-translate-y-px">
                        <FaArrowDown className="mr-1 text-lg leading-none text-red-500" /> PDF
                      </button>
                    </div>
                  </li>

                  <li className="relative flex justify-between px-4 py-2 pl-0 mb-2 border-0 rounded-xl text-inherit">
                    <div className="flex flex-col">
                      <h6 className="mb-1 text-sm font-semibold">February, 10, 2021</h6>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">#RV-126749</span>
                    </div>
                    <div className="flex items-center text-sm">
                      $250
                      <button className="inline-block px-0 py-2.5 mb-0 ml-6 font-bold leading-normal text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer ease-in text-sm active:opacity-85 hover:-translate-y-px">
                        <FaArrowUp className="mr-1 text-lg leading-none text-green-500" /> PDF
                      </button>
                    </div>
                  </li>

                  <li className="relative flex justify-between px-4 py-2 pl-0 mb-2 border-0 rounded-xl text-inherit">
                    <div className="flex flex-col">
                      <h6 className="mb-1 text-sm font-semibold">April, 05, 2020</h6>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">#FB-212562</span>
                    </div>
                    <div className="flex items-center text-sm">
                      $560
                      <button className="inline-block px-0 py-2.5 mb-0 ml-6 font-bold leading-normal text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer ease-in text-sm active:opacity-85 hover:-translate-y-px">
                        <FaExclamation className="mr-1 text-lg leading-none text-yellow-500" /> PDF
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}