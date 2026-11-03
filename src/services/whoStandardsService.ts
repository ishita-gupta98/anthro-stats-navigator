
import { supabase } from '@/integrations/supabase/client';

export interface WHOStandardsQuery {
  parameter: 'weight' | 'height' | 'head_circumference' | 'arm_circumference' | 'bmi';
  gender: 'male' | 'female';
  ageDays: number;
}

export interface WHOStandardsResult {
  meanValue: number;
  sdValue: number | null;
  lmsParams?: {
    l: number | null;
    m: number;
    s: number | null;
  };
  sdValues?: {
    sd4neg: number | null;
    sd3neg: number | null;
    sd2neg: number | null;
    sd1neg: number | null;
    sd0: number | null;
    sd1: number | null;
    sd2: number | null;
    sd3: number | null;
    sd4: number | null;
  };
}

export const getWHOStandard = async (query: WHOStandardsQuery): Promise<WHOStandardsResult | null> => {
  console.log('Fetching WHO standard for:', query);
  
  try {
    // First try to find exact age match
    let { data, error } = await supabase
      .from('who_standards')
      .select('*')
      .eq('parameter', query.parameter)
      .eq('gender', query.gender)
      .eq('age_days', query.ageDays)
      .maybeSingle();

    if (error) {
      console.error('Error fetching WHO standard:', error);
      return null;
    }

    if (data) {
      console.log('Found exact match for WHO standard:', data);
      return {
        meanValue: parseFloat(data.m.toString()),
        sdValue: data.s ? parseFloat(data.s.toString()) : null,
        lmsParams: {
          l: data.l ? parseFloat(data.l.toString()) : null,
          m: parseFloat(data.m.toString()),
          s: data.s ? parseFloat(data.s.toString()) : null
        },
        sdValues: {
          sd4neg: data.sd4neg ? parseFloat(data.sd4neg.toString()) : null,
          sd3neg: data.sd3neg ? parseFloat(data.sd3neg.toString()) : null,
          sd2neg: data.sd2neg ? parseFloat(data.sd2neg.toString()) : null,
          sd1neg: data.sd1neg ? parseFloat(data.sd1neg.toString()) : null,
          sd0: data.sd0 ? parseFloat(data.sd0.toString()) : null,
          sd1: data.sd1 ? parseFloat(data.sd1.toString()) : null,
          sd2: data.sd2 ? parseFloat(data.sd2.toString()) : null,
          sd3: data.sd3 ? parseFloat(data.sd3.toString()) : null,
          sd4: data.sd4 ? parseFloat(data.sd4.toString()) : null
        }
      };
    }

    // If no exact match, find the closest age within ±30 days
    const { data: closestData, error: closestError } = await supabase
      .from('who_standards')
      .select('*')
      .eq('parameter', query.parameter)
      .eq('gender', query.gender)
      .gte('age_days', query.ageDays - 30)
      .lte('age_days', query.ageDays + 30)
      .order('age_days');

    if (closestError) {
      console.error('Error fetching closest WHO standard:', closestError);
      return null;
    }

    if (!closestData || closestData.length === 0) {
      console.log('No WHO standards data found within range for:', query);
      return null;
    }

    // Find the closest age
    const closest = closestData.reduce((prev, curr) => {
      return Math.abs(curr.age_days - query.ageDays) < Math.abs(prev.age_days - query.ageDays) 
        ? curr 
        : prev;
    });

    console.log('Found closest match for WHO standard:', closest);
    
    return {
      meanValue: parseFloat(closest.m.toString()),
      sdValue: closest.s ? parseFloat(closest.s.toString()) : null,
      lmsParams: {
        l: closest.l ? parseFloat(closest.l.toString()) : null,
        m: parseFloat(closest.m.toString()),
        s: closest.s ? parseFloat(closest.s.toString()) : null
      },
      sdValues: {
        sd4neg: closest.sd4neg ? parseFloat(closest.sd4neg.toString()) : null,
        sd3neg: closest.sd3neg ? parseFloat(closest.sd3neg.toString()) : null,
        sd2neg: closest.sd2neg ? parseFloat(closest.sd2neg.toString()) : null,
        sd1neg: closest.sd1neg ? parseFloat(closest.sd1neg.toString()) : null,
        sd0: closest.sd0 ? parseFloat(closest.sd0.toString()) : null,
        sd1: closest.sd1 ? parseFloat(closest.sd1.toString()) : null,
        sd2: closest.sd2 ? parseFloat(closest.sd2.toString()) : null,
        sd3: closest.sd3 ? parseFloat(closest.sd3.toString()) : null,
        sd4: closest.sd4 ? parseFloat(closest.sd4.toString()) : null
      }
    };

  } catch (error) {
    console.error('Unexpected error fetching WHO standard:', error);
    return null;
  }
};
