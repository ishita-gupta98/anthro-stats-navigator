
import React, { useState } from 'react';
import { Calendar, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import AnthropometryResults from '@/components/AnthropometryResults';
import { calculateAnthropometry } from '@/utils/anthropometryCalculations';

interface FormData {
  dateOfBirth: Date | undefined;
  age: string;
  ageUnit: 'years' | 'months' | 'weeks';
  gender: 'male' | 'female';
  height: string;
  weight: string;
  midArmCircumference: string;
  headCircumference: string;
}

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    dateOfBirth: undefined,
    age: '',
    ageUnit: 'years',
    gender: 'male',
    height: '',
    weight: '',
    midArmCircumference: '',
    headCircumference: ''
  });

  // Calculate age in years for conditional rendering
  const getAgeInYears = () => {
    if (formData.dateOfBirth) {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - formData.dateOfBirth.getTime());
      return diffTime / (1000 * 60 * 60 * 24 * 365.25);
    } else if (formData.age) {
      const ageValue = parseFloat(formData.age);
      switch (formData.ageUnit) {
        case 'years':
          return ageValue;
        case 'months':
          return ageValue / 12;
        case 'weeks':
          return ageValue / 52.18;
        default:
          return 0;
      }
    }
    return 0;
  };

  const ageInYears = getAgeInYears();
  const shouldShowHeadCircumference = ageInYears < 2;
  const shouldShowMidArmCircumference = ageInYears >= 1 && ageInYears <= 5;
  const shouldShowBMI = ageInYears > 5;

  const handleCalculate = async () => {
    console.log('Calculating anthropometry with data:', formData);
    setIsCalculating(true);
    
    try {
      // Calculate age in months for calculations
      let ageInMonths = 0;
      if (formData.dateOfBirth) {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - formData.dateOfBirth.getTime());
        ageInMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Average days per month
      } else if (formData.age) {
        const ageValue = parseFloat(formData.age);
        switch (formData.ageUnit) {
          case 'years':
            ageInMonths = ageValue * 12;
            break;
          case 'months':
            ageInMonths = ageValue;
            break;
          case 'weeks':
            ageInMonths = ageValue / 4.33; // Average weeks per month
            break;
        }
      }

      const calculatedResults = await calculateAnthropometry({
        ageInMonths,
        gender: formData.gender,
        height: parseFloat(formData.height) || 0,
        weight: parseFloat(formData.weight) || 0,
        midArmCircumference: parseFloat(formData.midArmCircumference) || 0,
        headCircumference: parseFloat(formData.headCircumference) || 0,
        shouldCalculateBMI: shouldShowBMI,
        shouldCalculateHeadCirc: shouldShowHeadCircumference,
        shouldCalculateMidArm: shouldShowMidArmCircumference
      });

      setResults(calculatedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating anthropometry:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBackToCalculator = () => {
    setShowResults(false);
  };

  if (showResults && results) {
    return (
      <AnthropometryResults 
        results={results} 
        onBack={handleBackToCalculator}
        formData={formData}
        assessmentDate={new Date()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Anthropometry Calculator</h1>
          <p className="text-gray-600">Compare a baby's growth metrics with WHO charts to monitor healthy development</p>
        </div>

        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold text-center">
              AnthroMetric
            </CardTitle>
            <p className="text-center text-blue-100 mt-2">Enter measurements to calculate growth parameters</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {/* Date of Birth OR Age */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <Label className="text-lg font-medium">Date of Birth</Label>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? format(formData.dateOfBirth, "dd-MM-yyyy") : "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date, age: '' }))}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* OR Separator */}
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-gray-500 font-medium">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Age Input */}
              <div className="space-y-2">
                <Label className="text-lg font-medium">Age</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value, dateOfBirth: undefined }))}
                    className="flex-1"
                  />
                  <select
                    value={formData.ageUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, ageUnit: e.target.value as 'years' | 'months' | 'weeks' }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-4">
              <Label className="text-lg font-medium flex items-center gap-2">
                <span className="text-blue-500">👤</span>
                Gender
              </Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.gender === 'male' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={cn(
                    "flex-1 py-3",
                    formData.gender === 'male' && "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  Male
                </Button>
                <Button
                  type="button"
                  variant={formData.gender === 'female' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  className={cn(
                    "flex-1 py-3",
                    formData.gender === 'female' && "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  Female
                </Button>
              </div>
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label className="text-lg font-medium flex items-center gap-2">
                <span className="text-blue-500">📏</span>
                Height (cm)
              </Label>
              <Input
                placeholder="Enter height"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                className="py-3"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="text-lg font-medium flex items-center gap-2">
                <span className="text-blue-500">⚖️</span>
                Weight (kg)
              </Label>
              <Input
                placeholder="Enter weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="py-3"
              />
            </div>

            {/* Mid-Arm Circumference - Only show if age 1-5 years */}
            {shouldShowMidArmCircumference && (
              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <span className="text-blue-500">⭕</span>
                  Mid-Arm Circumference (cm)
                </Label>
                <Input
                  placeholder="Enter mid-arm circumference"
                  value={formData.midArmCircumference}
                  onChange={(e) => setFormData(prev => ({ ...prev, midArmCircumference: e.target.value }))}
                  className="py-3"
                />
              </div>
            )}

            {/* Head Circumference - Only show if age < 2 years */}
            {shouldShowHeadCircumference && (
              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center gap-2">
                  <span className="text-blue-500">⭕</span>
                  Head Circumference (cm)
                </Label>
                <Input
                  placeholder="Enter head circumference"
                  value={formData.headCircumference}
                  onChange={(e) => setFormData(prev => ({ ...prev, headCircumference: e.target.value }))}
                  className="py-3"
                />
              </div>
            )}

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              <Calculator className="mr-2 h-5 w-5" />
              {isCalculating ? 'Calculating...' : 'Calculate'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
