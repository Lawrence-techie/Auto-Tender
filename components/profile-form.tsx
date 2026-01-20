'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { profileFields, categories } from '@/lib/profile-fields';
import { ProfileFormData } from '@/types/profile';

// Create validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Profile name must be at least 2 characters'),
  companyInfo: z.object({
    companyName: z.string().min(2, 'Company name is required'),
    registrationNumber: z.string().min(5, 'Registration number is required'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    address: z.string().min(10, 'Address is required'),
    taxId: z.string().min(5, 'Tax ID is required'),
    directors: z.string().min(5, 'Directors information is required'),
    signature: z.string().min(2, 'Signature is required'),
  }),
  financialInfo: z.object({
    annualTurnover: z.string().min(1, 'Annual turnover is required'),
    bankReference: z.string().min(10, 'Bank reference is required'),
    creditFacility: z.string().min(10, 'Credit facility is required'),
    financialCapacity: z.string().min(10, 'Financial capacity is required'),
    bankGuarantee: z.string().min(10, 'Bank guarantee is required'),
    insurance: z.string().min(10, 'Insurance is required'),
  }),
  experienceInfo: z.object({
    similarProjects: z.string().min(20, 'Similar projects description is required'),
    projectValue: z.string().min(1, 'Project value is required'),
    completionDate: z.string().min(1, 'Completion date is required'),
    clientReference: z.string().min(10, 'Client reference is required'),
  }),
  technicalInfo: z.object({
    equipment: z.string().min(20, 'Equipment description is required'),
    personnel: z.string().min(20, 'Personnel description is required'),
    methodology: z.string().min(20, 'Methodology description is required'),
    timeline: z.string().min(20, 'Timeline description is required'),
  }),
});

type ProfileFormSchema = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  onCancel?: () => void;
}

export function ProfileForm({ initialData, onSubmit, onCancel }: ProfileFormProps) {
  const [activeCategory, setActiveCategory] = useState('companyInfo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {
      name: '',
      companyInfo: {
        companyName: '',
        registrationNumber: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        taxId: '',
        directors: '',
        signature: '',
      },
      financialInfo: {
        annualTurnover: '',
        bankReference: '',
        creditFacility: '',
        financialCapacity: '',
        bankGuarantee: '',
        insurance: '',
      },
      experienceInfo: {
        similarProjects: '',
        projectValue: '',
        completionDate: '',
        clientReference: '',
      },
      technicalInfo: {
        equipment: '',
        personnel: '',
        methodology: '',
        timeline: '',
      },
    },
  });

  const handleFormSubmit = async (data: ProfileFormSchema) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const fieldPath = `${field.category}.${field.name}` as any;
    const error = errors[field.category]?.[field.name as keyof typeof errors[typeof field.category]];

    switch (field.type) {
      case 'textarea':
        return (
          <Controller
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Textarea
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        );

      case 'email':
        return (
          <Controller
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                type="email"
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        );

      case 'phone':
        return (
          <Controller
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                type="tel"
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                type="date"
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        );

      default:
        return (
          <Controller
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                type="text"
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {initialData ? 'Edit Profile' : 'Create New Profile'}
        </h1>
        <p className="text-gray-600">
          Fill in your company information to create a profile for automated tender filling.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Profile Name */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Name</h2>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Profile Name"
                placeholder="Enter a name for this profile (e.g., ABC Construction Ltd)"
                value={value}
                onChange={onChange}
                error={errors.name?.message}
                helperText="This name will help you identify this profile when filling tenders"
              />
            )}
          />
        </div>

        {/* Category Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Information Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Category Fields */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {categories.find(c => c.id === activeCategory)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields
              .filter(field => field.category === activeCategory)
              .map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
} 