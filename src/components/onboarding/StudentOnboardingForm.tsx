// src/components/onboarding/StudentOnboardingForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStudentProfile } from "@/app/onboarding/actions";

// Placeholder data
const regions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

export const StudentOnboardingForm = ({ userEmail }: { userEmail: string }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <span className="text-5xl">🚀</span>
        <h1 className="font-serif text-3xl font-bold text-center text-brand-blue mt-2">
          Your Learning Adventure Awaits!
        </h1>
        <p className="text-center text-slate-600 mt-2">
          Tell us a little about yourself to get started.
        </p>
      </div>

      <form action={updateStudentProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" className="font-semibold text-brand-blue">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="e.g., Kofi Mensah"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="font-semibold text-brand-blue">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              value={userEmail}
              readOnly
              disabled
              className="bg-slate-100"
            />
          </div>
          <div>
            <Label
              htmlFor="dateOfBirth"
              className="font-semibold text-brand-blue"
            >
              Date of Birth
            </Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
          </div>
          <div>
            <Label htmlFor="gender" className="font-semibold text-brand-blue">
              Gender
            </Label>
            <Select name="gender" required>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="region" className="font-semibold text-brand-blue">
              Region
            </Label>
            <Select name="region" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="currentClass"
              className="font-semibold text-brand-blue"
            >
              Your Class / Grade
            </Label>
            <Input
              id="currentClass"
              name="currentClass"
              placeholder="e.g., JHS 1, SHS 2"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="schoolName" className="font-semibold text-brand-blue">
            School Name
          </Label>
          <Input
            id="schoolName"
            name="schoolName"
            placeholder="e.g., Ghana Senior High School"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg py-6"
        >
          Start Learning!
        </Button>
      </form>
    </div>
  );
};
