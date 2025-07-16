// src/components/onboarding/TeacherOnboardingForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTeacherProfile } from "@/app/onboarding/actions";

// Placeholder data - in a real app, this would come from a database
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

const subjects = [
  "Mathematics",
  "Integrated Science",
  "English Language",
  "Social Studies",
  "Computing",
  "French",
  "Ghanaian Language",
];

export const TeacherOnboardingForm = ({ userEmail }: { userEmail: string }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="font-serif text-3xl font-bold text-center text-brand-blue">
        Complete Your Teacher Profile
      </h1>
      <p className="text-center text-slate-600 mt-2 mb-8">
        This helps us personalize your LearnBridgeEdu experience.
      </p>

      <form action={updateTeacherProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" className="font-semibold text-brand-blue">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="e.g., Ama Serwaa"
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
            <Label htmlFor="gender" className="font-semibold text-brand-blue">
              Gender
            </Label>
            <Select name="gender" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
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
          <div>
            <Label
              htmlFor="yearsOfExperience"
              className="font-semibold text-brand-blue"
            >
              Years of Experience
            </Label>
            <Input
              id="yearsOfExperience"
              name="yearsOfExperience"
              type="number"
              placeholder="e.g., 5"
              required
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="positionRank"
            className="font-semibold text-brand-blue"
          >
            Current Position / Rank
          </Label>
          <Input
            id="positionRank"
            name="positionRank"
            placeholder="e.g., Classroom Teacher, Head of Department"
            required
          />
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
            <Label htmlFor="district" className="font-semibold text-brand-blue">
              District
            </Label>
            <Input
              id="district"
              name="district"
              placeholder="e.g., Adansi North"
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
            placeholder="e.g., Adansi North SHS"
            required
          />
        </div>

        <div>
          <Label className="font-semibold text-brand-blue">
            Subjects You Teach
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 p-4 border rounded-md">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox id={subject} name="subjects" value={subject} />
                <Label htmlFor={subject} className="font-normal">
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg py-6"
        >
          Complete Profile & Enter Dashboard
        </Button>
      </form>
    </div>
  );
};
