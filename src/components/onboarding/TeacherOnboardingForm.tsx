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
import { useState } from "react";
import { Plus, X } from "lucide-react";

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
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subject]);
    } else {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    }
  };

  const addCustomSubject = () => {
    if (
      newSubject.trim() &&
      !customSubjects.includes(newSubject.trim()) &&
      !subjects.includes(newSubject.trim())
    ) {
      const trimmedSubject = newSubject.trim();
      setCustomSubjects([...customSubjects, trimmedSubject]);
      setSelectedSubjects([...selectedSubjects, trimmedSubject]);
      setNewSubject("");
    }
  };

  const removeCustomSubject = (subject: string) => {
    setCustomSubjects(customSubjects.filter((s) => s !== subject));
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSubject();
    }
  };

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
            Subjects You Teach <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-slate-500 mb-3">
            Select at least one subject. Don't see your subject? Add it below.
          </p>

          {/* Predefined subjects */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 p-4 border rounded-md">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={(checked) =>
                    handleSubjectChange(subject, checked as boolean)
                  }
                />
                <Label htmlFor={subject} className="font-normal">
                  {subject}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom subjects */}
          {customSubjects.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-md">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Your Custom Subjects:
              </Label>
              <div className="flex flex-wrap gap-2">
                {customSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="flex items-center bg-brand-blue text-white px-3 py-1 rounded-full text-sm"
                  >
                    <span>{subject}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomSubject(subject)}
                      className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom subject */}
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add a subject not listed above"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addCustomSubject}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Hidden inputs for form submission */}
          {selectedSubjects.map((subject) => (
            <input
              key={subject}
              type="hidden"
              name="subjects"
              value={subject}
            />
          ))}
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
