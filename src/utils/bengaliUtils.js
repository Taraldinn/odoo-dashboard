// src/utils/bengaliUtils.js

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts any number or string of numbers into Bengali numerals
 * @param {number|string} input 
 * @returns {string}
 */
export function toBanglaDigits(input) {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

/**
 * Formats a number with comma separation and converts to chosen numeral system
 * @param {number} amount 
 * @param {string} numeralSystem - 'bangla' | 'english'
 * @param {number} decimals 
 * @returns {string}
 */
export function formatNumber(amount, numeralSystem = 'bangla', decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return numeralSystem === 'bangla' ? '০' : '0';
  
  const num = Number(amount);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return numeralSystem === 'bangla' ? toBanglaDigits(formatted) : formatted;
}

/**
 * Formats currency (e.g. ৳ ১,২৫,০০ বা ৳ 125,000)
 * @param {number} amount 
 * @param {string} currencySymbol - '৳' | 'BDT' | 'USD'
 * @param {string} numeralSystem - 'bangla' | 'english'
 * @param {number} decimals 
 * @returns {string}
 */
export function formatCurrency(amount, currencySymbol = '৳', numeralSystem = 'bangla', decimals = 0) {
  const formattedNum = formatNumber(amount, numeralSystem, decimals);
  if (currencySymbol === 'BDT') {
    return `${formattedNum} বিডিটি`;
  }
  return `${currencySymbol} ${formattedNum}`;
}

/**
 * Formats percentage with sign
 * @param {number} percent 
 * @param {string} numeralSystem 
 * @returns {string}
 */
export function formatPercent(percent, numeralSystem = 'bangla') {
  if (percent === null || percent === undefined || isNaN(percent)) return numeralSystem === 'bangla' ? '০%' : '0%';
  const sign = percent > 0 ? '+' : '';
  const formatted = `${sign}${percent.toFixed(1)}%`;
  return numeralSystem === 'bangla' ? toBanglaDigits(formatted) : formatted;
}

const banglaMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const banglaDays = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

/**
 * Formats Date object into Bengali readable date string
 * @param {Date|string|number} date 
 * @param {string} numeralSystem 
 * @returns {string}
 */
export function formatBanglaDate(date, numeralSystem = 'bangla') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const month = banglaMonths[d.getMonth()];
  const year = d.getFullYear();

  const dayFormatted = numeralSystem === 'bangla' ? toBanglaDigits(day) : day;
  const yearFormatted = numeralSystem === 'bangla' ? toBanglaDigits(year) : year;

  return `${dayFormatted} ${month}, ${yearFormatted}`;
}

/**
 * Formats time into Bengali 12-hour AM/PM string
 * @param {Date|string|number} date 
 * @param {string} numeralSystem 
 * @returns {string}
 */
export function formatBanglaTime(date, numeralSystem = 'bangla') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  const period = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const timeStr = `${hours}:${minutes}:${seconds}`;
  const timeFormatted = numeralSystem === 'bangla' ? toBanglaDigits(timeStr) : timeStr;

  return `${period} ${timeFormatted}`;
}

/**
 * Returns human-friendly relative time in Bengali (e.g., 'এখনই', '৫ সেকেন্ড আগে', '১০ মিনিট আগে')
 * @param {Date|string|number} date 
 * @param {string} numeralSystem 
 * @returns {string}
 */
export function getRelativeTimeBangla(date, numeralSystem = 'bangla') {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 5) return 'এইমাত্র';
  if (diffInSeconds < 60) {
    const s = numeralSystem === 'bangla' ? toBanglaDigits(diffInSeconds) : diffInSeconds;
    return `${s} সেকেন্ড আগে`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const m = numeralSystem === 'bangla' ? toBanglaDigits(diffInMinutes) : diffInMinutes;
    return `${m} মিনিট আগে`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const h = numeralSystem === 'bangla' ? toBanglaDigits(diffInHours) : diffInHours;
    return `${h} ঘণ্টা আগে`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  const days = numeralSystem === 'bangla' ? toBanglaDigits(diffInDays) : diffInDays;
  return `${days} দিন আগে`;
}
