"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileUser {
  id: string;
  name: string | null;
  displayName: string | null;
  email: string;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  favoriteTeam: string | null;
  bio: string | null;
}

interface ProfileSettingsFormProps {
  user: ProfileUser;
}

export default function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    birthdayMonth: user.birthdayMonth?.toString() || '',
    birthdayDay: user.birthdayDay?.toString() || '',
    favoriteTeam: user.favoriteTeam || '',
    bio: user.bio || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Validate birthday if provided
    if (formData.birthdayMonth || formData.birthdayDay) {
      const month = parseInt(formData.birthdayMonth);
      const day = parseInt(formData.birthdayDay);
      
      if (!formData.birthdayMonth || !formData.birthdayDay) {
        setError('Please provide both month and day for your birthday, or leave both empty.');
        return false;
      }
      
      if (month < 1 || month > 12) {
        setError('Birthday month must be between 1 and 12.');
        return false;
      }
      
      if (day < 1 || day > 31) {
        setError('Birthday day must be between 1 and 31.');
        return false;
      }

      // Basic day validation for specific months
      if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
        setError('Invalid day for the selected month.');
        return false;
      }
      
      if (month === 2 && day > 29) {
        setError('February cannot have more than 29 days.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updateData = {
        displayName: formData.displayName.trim() || null,
        birthdayMonth: formData.birthdayMonth ? parseInt(formData.birthdayMonth) : null,
        birthdayDay: formData.birthdayDay ? parseInt(formData.birthdayDay) : null,
        favoriteTeam: formData.favoriteTeam.trim() || null,
        bio: formData.bio.trim() || null
      };

      console.log('Sending data:', updateData); // Debug log

      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response headers:', response.headers); // Debug log

      if (!response.ok) {
        const responseText = await response.text(); // Get text first
        console.log('Response text:', responseText); // Debug log
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information and preferences.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Profile updated successfully! Redirecting to your profile...
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="How you want to appear in the league"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  This is how other league members will see your name.
                </p>
              </div>

              {/* Birthday */}
              <div className="space-y-4">
                <Label>Birthday (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthdayMonth" className="text-sm">Month (1-12)</Label>
                    <Input
                      id="birthdayMonth"
                      name="birthdayMonth"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.birthdayMonth}
                      onChange={handleInputChange}
                      placeholder=""
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdayDay" className="text-sm">Day (1-31)</Label>
                    <Input
                      id="birthdayDay"
                      name="birthdayDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.birthdayDay}
                      onChange={handleInputChange}
                      placeholder=""
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll only show the month and day, not the year. Leave empty if you prefer not to share.
                </p>
              </div>

              {/* Favorite Team */}
              <div className="space-y-2">
                <Label htmlFor="favoriteTeam">Favorite Team (Optional)</Label>
                <Input
                  id="favoriteTeam"
                  name="favoriteTeam"
                  type="text"
                  value={formData.favoriteTeam}
                  onChange={handleInputChange}
                  placeholder=""
                  disabled={loading}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  disabled={loading}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href="/profile">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}