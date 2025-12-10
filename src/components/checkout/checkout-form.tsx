'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import { DeliveryForm } from './delivery-form';
import { CHECKOUT_STEPS, type CheckoutFormData } from '@/types/checkout';
import { Check, ChevronLeft, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Validation schema
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  fullName: z.string().min(2, 'Please enter your full name'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  fulfillmentType: z.enum(['delivery', 'pickup']),
  deliveryAddress: z
    .object({
      street: z.string().min(1, 'Street address is required'),
      apt: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().length(2, 'State must be 2 characters'),
      zip: z.string().length(5, 'ZIP code must be 5 digits'),
    })
    .optional(),
  deliveryInstructions: z.string().optional(),
  deliveryDate: z.string().min(1, 'Please select a delivery date'),
  deliveryWindow: z.string().min(1, 'Please select a time window'),
  saveCard: z.boolean().default(false),
  specialInstructions: z.string().optional(),
});

interface CheckoutFormProps {
  onDeliveryFeeChange?: (fee: number) => void;
  discountData?: {
    discountCodeId: string;
    code: string;
    discountAmount: number;
    discountType: string;
  } | null;
}

export function CheckoutForm({ onDeliveryFeeChange, discountData }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeliveryFeeChange = (fee: number) => {
    setDeliveryFee(fee);
    onDeliveryFeeChange?.(fee);
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      fullName: '',
      phone: '',
      fulfillmentType: 'delivery',
      deliveryAddress: {
        street: '',
        apt: '',
        city: '',
        state: 'CA',
        zip: '',
      },
      deliveryInstructions: '',
      deliveryDate: '',
      deliveryWindow: '',
      saveCard: false,
      specialInstructions: '',
    },
  });

  // Load user profile data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Load customer profile
    interface CustomerProfile {
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
    }
    const { data: profile } = await (supabase
      .from('customer_profiles') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('id', user.id)
      .single() as { data: CustomerProfile | null };

    // Load default address
    interface CustomerAddress {
      street: string;
      apt: string | null;
      city: string;
      state: string;
      zip: string;
      delivery_instructions: string | null;
    }
    const { data: defaultAddress } = await (supabase
      .from('customer_addresses') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single() as { data: CustomerAddress | null };

    // Pre-fill form with user data
    if (user.email) {
      form.setValue('email', user.email);
    }

    if (profile) {
      const fullName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(' ');
      if (fullName) {
        form.setValue('fullName', fullName);
      }
      if (profile.phone) {
        form.setValue('phone', profile.phone);
      }
    }

    // Pre-fill default address
    if (defaultAddress) {
      form.setValue('deliveryAddress', {
        street: defaultAddress.street,
        apt: defaultAddress.apt || '',
        city: defaultAddress.city,
        state: defaultAddress.state,
        zip: defaultAddress.zip,
      });
      if (defaultAddress.delivery_instructions) {
        form.setValue('deliveryInstructions', defaultAddress.delivery_instructions);
      }
    }
  };

  const currentStepId = CHECKOUT_STEPS[currentStep].id;

  // Validate current step before proceeding
  const validateStep = async () => {
    if (currentStepId === 'cart') {
      return items.length > 0;
    }

    if (currentStepId === 'delivery') {
      const fieldsToValidate: (keyof CheckoutFormData)[] = [
        'email',
        'fullName',
        'phone',
        'deliveryDate',
        'deliveryWindow',
      ];

      // Add address fields if delivery is selected
      if (form.watch('fulfillmentType') === 'delivery') {
        const addressValid = await form.trigger([
          'deliveryAddress.street',
          'deliveryAddress.city',
          'deliveryAddress.state',
          'deliveryAddress.zip',
        ]);
        if (!addressValid) return false;
      }

      return await form.trigger(fieldsToValidate);
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) {
      toast.error('Please complete all required fields');
      return;
    }

    if (currentStep < CHECKOUT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items,
          subtotal,
          deliveryFee,
          discountCodeId: discountData?.discountCodeId || null,
          discountAmount: discountData?.discountAmount || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        // Clear cart before redirecting
        clearCart();
        window.location.href = result.sessionUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process checkout');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {CHECKOUT_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1 min-w-[80px]">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-colors',
                  index < currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <span className="text-xs md:text-sm">{index + 1}</span>
                )}
              </div>
              <div className="text-center mt-1 md:mt-2">
                <p
                  className={cn(
                    'text-xs md:text-sm font-medium whitespace-nowrap',
                    index === currentStep ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground hidden lg:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < CHECKOUT_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-[2px] flex-1 transition-colors min-w-[20px]',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStepId === 'cart' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Review Your Order</h2>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Button className="mt-4" onClick={() => router.push('/products')}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.variantName}
                        </p>
                        <p className="text-sm mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStepId === 'delivery' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Delivery Details</h2>
              <DeliveryForm form={form} onDeliveryFeeChange={handleDeliveryFeeChange} />
            </div>
          )}

          {currentStepId === 'payment' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Complete Your Order</h2>
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium">
                      {form.watch('fulfillmentType') === 'delivery'
                        ? 'Delivery Address'
                        : 'Pickup at Bakery'}
                    </p>
                    {form.watch('fulfillmentType') === 'delivery' ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>{form.watch('deliveryAddress.street')}</p>
                        {form.watch('deliveryAddress.apt') && (
                          <p>{form.watch('deliveryAddress.apt')}</p>
                        )}
                        <p>
                          {form.watch('deliveryAddress.city')},{' '}
                          {form.watch('deliveryAddress.state')}{' '}
                          {form.watch('deliveryAddress.zip')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        123 Baker Street, Los Angeles, CA 90001
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium">
                      {form.watch('fulfillmentType') === 'delivery'
                        ? 'Delivery'
                        : 'Pickup'}{' '}
                      Time
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.watch('deliveryDate')} · {form.watch('deliveryWindow')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.watch('fullName')} · {form.watch('email')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('phone')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  By clicking &quot;Place Order&quot;, you&apos;ll be redirected to our secure
                  payment processor (Stripe) to complete your purchase.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isProcessing}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < CHECKOUT_STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={items.length === 0}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isProcessing || items.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
