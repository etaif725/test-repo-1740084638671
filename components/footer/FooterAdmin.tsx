'use client';

import { Divider } from "@mui/material";

/*eslint-disable*/

export default function Footer() {
  return (
    <>
      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
      <div className="flex w-full flex-col items-center justify-between px-1 py-4 xl:flex-row">
        <p className="mb-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:!mb-0 md:text-lg">
          <span className="mb-4 text-center text-sm text-zinc-500 dark:text-zinc-400 sm:!mb-0 md:text-sm">
            ©{new Date().getFullYear()} DialWise AI All Rights Reserved.
          </span>
        </p>
        <div>
          <ul className="flex flex-wrap items-center gap-3 sm:flex-nowrap md:gap-10">
            <li>
              <a
                target="blank"
                href="https://dialwise.ai/faqs"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400"
              >
                FAQs
              </a>
            </li>
            <li>
              <a
                target="blank"
                href="https://dialwise.ai/privacy"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                target="blank"
                href="https://dialwise.ai/terms"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400"
              >
                Terms & Conditions
              </a>
            </li>
            <li>
              <a
                target="blank"
                href="mailto:info@dialwise.ai"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
