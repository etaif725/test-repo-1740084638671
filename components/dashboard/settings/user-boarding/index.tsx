'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { KbUpload } from '@/components/dashboard/knowledge-base/components/kb-upload';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const supabase = createClient();

export default function NewUserBoarding(props: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    avatarUrl: ''
  });

  const [orgInfo, setOrgInfo] = useState({
    companyName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    website: '',
    email: '',
    phone: '',
    socials: {
      youtube: '',
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      tiktok: ''
    }
  });

  useEffect(() => {
    if (currentStep === 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${props.user?.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    setBasicInfo(prev => ({
      ...prev,
      avatarUrl: data.path
    }));
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('users')
      .update({
        full_name: `${basicInfo.firstName} ${basicInfo.lastName}`,
        avatar_url: basicInfo.avatarUrl,
        billing_address: {
          address1: basicInfo.address1,
          address2: basicInfo.address2,
          city: basicInfo.city,
          state: basicInfo.state,
          country: basicInfo.country,
          zip: basicInfo.zip
        }
      })
      .eq('id', props.user?.id);

    if (error) {
      console.error(error);
      setIsSubmitting(false);
      return;
    }

    setCurrentStep(2);
    setIsSubmitting(false);
  };

  const handleOrgInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Update organization info in users table
    const { error } = await supabase
      .from('users')
      .update({
        metadata: {
          organization: {
            ...orgInfo
          }
        }
      })
      .eq('id', props.user?.id);

    if (error) {
      console.error(error);
      setIsSubmitting(false);
      return;
    }

    setCurrentStep(3);
    setIsSubmitting(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={basicInfo.firstName}
                  onChange={e => setBasicInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2"> 
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={basicInfo.lastName}
                  onChange={e => setBasicInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address1">Address 1</Label>
                <Input
                  id="address1"
                  value={basicInfo.address1}
                  onChange={e => setBasicInfo(prev => ({ ...prev, address1: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address2">Address 2</Label>
                <Input
                  id="address2"
                  value={basicInfo.address2}
                  onChange={e => setBasicInfo(prev => ({ ...prev, address2: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={basicInfo.city}
                  onChange={e => setBasicInfo(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={basicInfo.state}
                  onChange={e => setBasicInfo(prev => ({ ...prev, state: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={basicInfo.country}
                  onChange={e => setBasicInfo(prev => ({ ...prev, country: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Zip</Label>
                <Input
                  id="zip"
                  value={basicInfo.zip}
                  onChange={e => setBasicInfo(prev => ({ ...prev, zip: e.target.value }))}
                  required
                />
              </div>  
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Next Step
            </Button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleOrgInfoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={orgInfo.companyName}
                  onChange={e => setOrgInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>
              {/* Add remaining form fields similarly */}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Next Step
            </Button>
          </form>
        );

      case 3:
        return (
          <div>
            <KbUpload user={props.user} userDetails={props.userDetails} />
            <Button onClick={() => setCurrentStep(4)} className="mt-4">
              Complete Setup
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-4 text-black dark:text-white">
            <h2 className="text-3xl font-bold">Congratulations! 🎉</h2>
            <p>Your account has been successfully set up.</p>
            <p className="text-sm text-gray-500">
              Redirecting to homepage in {countdown} seconds...
            </p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Account Setup"
      description="Let's teach your AI Employees everything they need to know about your business."
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="absolute h-2 text-black dark:text-white bg-yellow-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep ? 'bg-green-500 text-black font-bold' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6 text-black dark:text-white">
          {renderStep()}
        </Card>
      </div>
    </DashboardLayout>
  );
}
