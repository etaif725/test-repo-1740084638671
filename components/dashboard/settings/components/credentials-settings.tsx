/*eslint-disable*/
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Notification from '@/components/notification';
import { HiOutlineBellAlert } from 'react-icons/hi2';
import { Switch } from '@/components/ui/switch';
import { HiOutlineCheck } from 'react-icons/hi';
import Credentials from '@/components/credentials';

interface Props {
  credentials: {
    retell_api_key: string;
    calcom_api_key: string;
    vapi_api_key: string;
    twilio_sid: string;
    twilio_auth_token: string;
    twilio_phone_number: string;
    resend_api_key: string;
    className?: string;
  }[];
}

export default function Settings(props: Props) {
  return (
    <Card
      className={
        'mb-5 mr-0 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800 md:mb-0'
      }
    >
      <div>
        <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
          Credentials & API Keys
        </p>
        <p className="mb-5 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
          Please input your credentials and API keys below.
        </p>
      </div>
      <Card
        className={
          'mb-5 h-min flex items-center max-w-full py-4 px-4 dark:border-zinc-800'
        }
      >
        <HiOutlineBellAlert className="w-6 h-6 me-4" />
        <div>
          <p className="text-zinc-950 dark:text-white font-medium mb-1">
            Push Notifications
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Send notifications to device.
          </p>
        </div>
        <Switch className="ms-auto" />
      </Card>
      {props.credentials.map((notification, key) => {
        return (
          <Credentials
            key={key}
            className={key < props.credentials.length - 1 ? 'mb-6' : ''}
          />
        );
      })}

      <Button className="flex h-full w-full max-w-full mt-6 items-center justify-center rounded-lg px-4 py-4 text-base font-medium">
        <HiOutlineCheck className="me-2 h-6 w-6" /> Mark all as read
      </Button>
    </Card>
  );
}
