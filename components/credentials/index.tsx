/*eslint-disable*/
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';

interface Props {
  className?: string;
}

export default function Credentials(props: Props) {
  return (
    <Card
      className={
        'mb-5 w-full pt-8 pb-6 px-6 dark:border-zinc-800'
      }
    >
      <div>
        <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
          Credentials & API Keys
        </p>
        <p className="mb-5 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
          Please input your credentials and API keys below.
        </p>
        <hr className="my-8" />
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Voice & Conversation</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">API keys for voice synthesis and conversation management</p>
          <div className="mb-8 flex flex-col md:flex-row">
            <form className="w-full" id="retellForm">
              <Input
                type="text"
                name="retell_api_key"
                placeholder="Enter your Retell API key"
                className="mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0"
              />
            </form>
            <Button
              className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
              form="retellForm"
              type="submit"
            >
              Save
            </Button>
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Appointments & Email Campaigns</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">API keys for calendar and appointment scheduling and email campaigns</p>
          
          <div className="mb-8 flex flex-col md:flex-row">
            <form className="w-full" id="calcomForm">
              <Input
                type="text"
                name="calcom_api_key"
                placeholder="Enter your Cal.com API key"
                className="mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0"
              />
            </form>
            <Button
              className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
              form="calcomForm"
              type="submit"
            >
              Save
            </Button>
          </div>

          <div className="mb-8 flex flex-col md:flex-row">
            <form className="w-full" id="resendForm">
              <Input
                type="text"
                name="resend_api_key"
                placeholder="Enter your Resend API key"
                className="mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0"
              />
            </form>
            <Button
              className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
              form="resendForm"
              type="submit"
            >
              Save
            </Button>
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Telephony</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">API keys for email and SMS services</p>
          
          <div className="mb-8 flex flex-col md:flex-row">
            <form className="w-full" id="twilioSidForm">
              <Input
                type="text"
                name="twilio_sid"
                placeholder="Enter your Twilio SID"
                className="mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0"
              />
            </form>
            <Button
              className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
              form="twilioSidForm"
              type="submit"
            >
              Save
            </Button>
          </div>

          <div className="mb-8 flex flex-col md:flex-row">
            <form className="w-full" id="twilioAuthForm">
              <Input
                type="text"
                name="twilio_auth_token"
                placeholder="Enter your Twilio Auth Token"
                className="mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0"
              />
            </form>
            <Button
              className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
              form="twilioAuthForm"
              type="submit"
            >
              Save
            </Button>
          </div>

          <div className="mb-8 flex flex-col md:flex-row">
            <form className="w-full" id="twilioPhoneForm">
              <Input
                type="text"
                name="twilio_phone_number"
                placeholder="Enter your Twilio Phone Number"
                className="mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0"
              />
            </form>
            <Button
              className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
              form="twilioPhoneForm"
              type="submit"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
