
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResultsData {
  ageInMonths: number;
  gender: string;
  height: {
    actual: number;
    expected: number;
    sd: number;
    centile: number | null;
  };
  weight: {
    actual: number;
    expected: number;
    sd: number;
    centile: number;
  };
  headCircumference: {
    actual: number;
    expected: number;
    sd: number;
    centile: number | null;
  };
  midArmCircumference: {
    actual: number;
    expected: number;
    sd: number;
    centile: number;
  };
  bmi: {
    actual: number;
    expected: number | null;
    sd: number | null;
    centile: number | null;
  };
  shouldCalculateBMI?: boolean;
  shouldCalculateHeadCirc?: boolean;
  shouldCalculateMidArm?: boolean;
}

interface AnthropometryResultsProps {
  results: ResultsData;
  onBack: () => void;
  formData: any;
  assessmentDate: Date;
}

const AnthropometryResults: React.FC<AnthropometryResultsProps> = ({ 
  results, 
  onBack, 
  formData, 
  assessmentDate 
}) => {
  const formatAge = () => {
    const ageInMonths = results.ageInMonths;
    const years = Math.floor(ageInMonths / 12);
    const months = Math.floor(ageInMonths % 12);
    const weeks = Math.floor((ageInMonths % 1) * 4.33);
    
    if (years > 0) {
      return `${years}.${months} years (${ageInMonths.toFixed(1)} months / ${(ageInMonths * 4.33).toFixed(1)} weeks)`;
    } else if (months > 0) {
      return `${ageInMonths.toFixed(1)} months (${(ageInMonths * 4.33).toFixed(1)} weeks)`;
    } else {
      return `${(ageInMonths * 4.33).toFixed(1)} weeks`;
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  };

  const formatCentile = (centile: number | null) => {
    if (centile === null || centile === undefined) return '-';
    return Math.round(centile).toString();
  };

  const getHealthStatus = (sd: number | null, centile: number | null) => {
    if (sd === null || sd === undefined) return { status: 'unknown', color: 'text-gray-500', bgColor: 'bg-gray-50', icon: Minus };
    
    if (sd < -2) return { status: 'below', color: 'text-red-600', bgColor: 'bg-red-50', icon: TrendingDown };
    if (sd > 2) return { status: 'above', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: TrendingUp };
    return { status: 'normal', color: 'text-green-600', bgColor: 'bg-green-50', icon: TrendingUp };
  };

  const getInterpretation = (sd: number | null) => {
    if (sd === null || sd === undefined) return 'Data not available';
    if (sd < -3) return 'Severely below normal';
    if (sd < -2) return 'Below normal';
    if (sd < -1) return 'Slightly below normal'; 
    if (sd <= 1) return 'Normal range';
    if (sd <= 2) return 'Slightly above normal';
    if (sd <= 3) return 'Above normal';
    return 'Severely above normal';
  };

  // Filter parameters based on age-appropriate conditions
  const allParameters = [
    { key: 'height', label: 'Height', unit: 'cm', data: results.height, show: true },
    { key: 'weight', label: 'Weight', unit: 'kg', data: results.weight, show: true },
    { key: 'headCircumference', label: 'Head Circumference', unit: 'cm', data: results.headCircumference, show: results.shouldCalculateHeadCirc },
    { key: 'midArmCircumference', label: 'Mid-Arm Circumference', unit: 'cm', data: results.midArmCircumference, show: results.shouldCalculateMidArm },
    { key: 'bmi', label: 'BMI', unit: 'kg/m²', data: results.bmi, show: results.shouldCalculateBMI },
  ];

  const parameters = allParameters.filter(param => param.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Anthropometry Results</h1>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm inline-block">
            <p className="text-lg text-gray-700 font-medium">
              {formData.gender === 'male' ? '👦 Male' : '👧 Female'} • {formatAge()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Assessment Date: {formatDateTime(assessmentDate)}
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Detailed Table */}
          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                📊 Detailed Measurements
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Parameter</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Actual</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Expected</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Z-Score</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">Centile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map((param) => {
                    const healthStatus = getHealthStatus(param.data.sd, param.data.centile);
                    return (
                      <TableRow key={param.key} className={`hover:bg-gray-50 transition-colors ${healthStatus.bgColor}`}>
                        <TableCell className="font-medium text-gray-800">
                          {param.label} ({param.unit})
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-900">
                          {formatValue(param.data.actual)}
                        </TableCell>
                        <TableCell className="text-center text-gray-600">
                          {formatValue(param.data.expected)}
                        </TableCell>
                        <TableCell className={`text-center font-medium ${healthStatus.color}`}>
                          <div className="flex items-center justify-center gap-1">
                            <healthStatus.icon size={16} />
                            {formatValue(param.data.sd)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-700">
                          {formatCentile(param.data.centile)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Health Status Summary */}
          <div className="space-y-4">
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  🏥 Health Status Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                {parameters.map((param) => {
                  const healthStatus = getHealthStatus(param.data.sd, param.data.centile);
                  const interpretation = getInterpretation(param.data.sd);
                  
                  return (
                    <div key={param.key} className={`p-4 rounded-lg border-l-4 ${healthStatus.bgColor} ${
                      healthStatus.status === 'normal' ? 'border-l-green-500' :
                      healthStatus.status === 'below' ? 'border-l-red-500' :
                      healthStatus.status === 'above' ? 'border-l-orange-500' : 'border-l-gray-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{param.label}</h4>
                        <div className={`flex items-center gap-1 ${healthStatus.color}`}>
                          <healthStatus.icon size={18} />
                          <span className="font-medium">{formatValue(param.data.sd)} SD</span>
                        </div>
                      </div>
                      <p className={`text-sm ${healthStatus.color} font-medium`}>
                        {interpretation}
                      </p>
                      {param.data.centile && (
                        <p className="text-xs text-gray-600 mt-1">
                          {formatCentile(param.data.centile)} percentile
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="shadow-lg bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Understanding Z-Scores</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-l-4 border-l-green-500 rounded"></div>
                    <span className="text-gray-700">Normal: -2 to +2 SD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-l-4 border-l-red-500 rounded"></div>
                    <span className="text-gray-700">Below normal: &lt; -2 SD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border-l-4 border-l-orange-500 rounded"></div>
                    <span className="text-gray-700">Above normal: &gt; +2 SD</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={onBack}
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Calculate Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnthropometryResults;
