import { useState, useCallback } from 'react';

interface UseTradeLevelReturn {
  trade: string;
  level: string;
  course: string;
  setTrade: (trade: string) => void;
  setLevel: (level: string) => void;
  setCourse: (course: string) => void;
  reset: () => void;
  isValid: boolean;
  getData: () => { trade: string; level: string; course?: string };
}

export const useTradeLevel = (includeCourse = false): UseTradeLevelReturn => {
  const [trade, setTrade] = useState('');
  const [level, setLevel] = useState('');
  const [course, setCourse] = useState('');

  const reset = useCallback(() => {
    setTrade('');
    setLevel('');
    setCourse('');
  }, []);

  const isValid = includeCourse ? !!(trade && level && course) : !!(trade && level);

  const getData = useCallback(() => {
    const data: any = { trade, level };
    if (includeCourse && course) data.course = course;
    return data;
  }, [trade, level, course, includeCourse]);

  return {
    trade,
    level,
    course,
    setTrade,
    setLevel,
    setCourse,
    reset,
    isValid,
    getData
  };
};
