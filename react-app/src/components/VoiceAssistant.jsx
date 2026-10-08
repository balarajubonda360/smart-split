import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../services/billService';
import { paymentService } from '../services/paymentService';

const money = (amount) => `\u20B9${Number(amount || 0).toLocaleString('en-IN')}`;
const unpaid = (bill) => !['PAID', 'SUCCESS'].includes(String(bill.status || '').toUpperCase());
const supportedLanguages = ['en-IN', 'hi-IN', 'te-IN'];
const getLanguagePreference = (userId) => {
  try {
    const language = window.localStorage.getItem(`spy-language:${userId || 'default'}`);
    return supportedLanguages.includes(language) ? language : 'en-IN';
  } catch {
    return 'en-IN';
  }
};
const localizedText = (language, english, hindi, telugu) => language === 'hi-IN' ? hindi : language === 'te-IN' ? telugu : english;
const localizeControlError = (error, language) => {
  const missing = error.match(/^I couldn’t find a visible control called (.+)\.$/);
  if (missing) return localizedText(language,
    error,
    `${missing[1]} नाम का कोई दिखाई देने वाला नियंत्रण नहीं मिला।`,
    `${missing[1]} అనే కనిపించే నియంత్రణ కనబడలేదు.`,
  );
  const ambiguous = error.match(/^I found more than one control called (.+)\. Please say a more specific name\.$/);
  if (ambiguous) return localizedText(language,
    error,
    `${ambiguous[1]} नाम के कई नियंत्रण मिले। कृपया अधिक स्पष्ट नाम बताएं।`,
    `${ambiguous[1]} అనే ఒకటి కంటే ఎక్కువ నియంత్రణలు కనిపించాయి. దయచేసి మరింత స్పష్టంగా చెప్పండి.`,
  );
  return error;
};

export const SpyLogo = () => {
  const gradientId = useId();
  return <svg className="spy-mascot" viewBox="0 0 80 96" aria-hidden="true">
    <defs>
      <linearGradient id={`${gradientId}-shell`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f7fbff" /><stop offset=".32" stopColor="#8cecf0" /><stop offset="1" stopColor="#386f9a" /></linearGradient>
      <linearGradient id={`${gradientId}-face`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#213956" /><stop offset=".58" stopColor="#101c36" /><stop offset="1" stopColor="#080e20" /></linearGradient>
      <linearGradient id={`${gradientId}-glow`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fff2a8" /><stop offset="1" stopColor="#ffad43" /></linearGradient>
      <linearGradient id={`${gradientId}-coat`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#52658a" /><stop offset=".48" stopColor="#253858" /><stop offset="1" stopColor="#17243a" /></linearGradient>
    </defs>
    <ellipse cx="40" cy="91" rx="25" ry="4" fill="#080d1b" opacity=".42" />
    <path d="M18 21 25 9h29l9 12-22 5z" fill="#17243a" stroke="#8cecf0" strokeWidth="2" /><path d="M13 24q27-9 54 0l-4 5H17z" fill="#263c5b" stroke="#8cecf0" strokeWidth="1.5" />
    <path d="M40 15v8" stroke={`url(#${gradientId}-shell)`} strokeLinecap="round" strokeWidth="3" /><circle cx="40" cy="13" r="3" fill={`url(#${gradientId}-glow)`} />
    <path d="M26 53 18 60l-3 13 7 2 7-14m25-8 8 7 3 13-7 2-7-14" fill="none" stroke={`url(#${gradientId}-shell)`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
    <path d="m27 51-9 9 9 7-4 17h34l-4-17 9-7-9-9-13 6z" fill={`url(#${gradientId}-coat)`} stroke="#8cecf0" strokeOpacity=".65" strokeWidth="1.5" />
    <path d="m34 53 6 7 6-7-2 18h-8z" fill="#ffad43" /><circle cx="40" cy="63" r="2" fill="#fff2a8" /><path d="M31 77h18" stroke="#8cecf0" strokeOpacity=".55" strokeWidth="2" />
    <path d="m31 82-1 7h-9q-2 0-1-3l5-5m24 1 1 7h9q2 0 1-3l-5-5" fill="#243955" stroke={`url(#${gradientId}-shell)`} strokeWidth="2" />
    <path d="M20 29c0-5 4-9 9-9h22c5 0 9 4 9 9v15c0 7-6 12-12 12H32c-7 0-12-5-12-12z" fill={`url(#${gradientId}-shell)`} stroke="#d5fcff" strokeWidth="1.5" />
    <path d="M17 34h4v9h-4m42-9h4v9h-4" fill="#20334f" stroke="#8cecf0" strokeWidth="2" />
    <rect x="24" y="29" width="32" height="20" rx="8" fill={`url(#${gradientId}-face)`} />
    <ellipse cx="33" cy="38" rx="3" ry="3.7" fill={`url(#${gradientId}-glow)`} /><ellipse cx="47" cy="38" rx="3" ry="3.7" fill={`url(#${gradientId}-glow)`} />
    <path d="M35 45h10" stroke="#8cecf0" strokeLinecap="round" strokeWidth="2" /><path d="M28 31h20" stroke="#fff" strokeOpacity=".22" strokeLinecap="round" strokeWidth="1.5" />
  </svg>;
};

const normalizeName = (value = '') => value.toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const getAccessibleName = (element) => {
  const labelledBy = element.getAttribute('aria-labelledby')?.split(/\s+/).map((id) => document.getElementById(id)?.innerText).filter(Boolean).join(' ');
  return normalizeName([
    element.getAttribute('aria-label'), labelledBy, element.getAttribute('placeholder'), element.getAttribute('title'), element.getAttribute('alt'),
    element.name?.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' '), element.id?.replace(/[-_]/g, ' '),
    element.labels ? [...element.labels].map((label) => label.innerText).join(' ') : '',
    element.innerText || element.textContent,
  ].filter(Boolean).join(' '));
};
const isVisible = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
const findControl = (selectors, query) => {
  const needle = normalizeName(query);
  const matches = [...document.querySelectorAll(selectors)]
    .filter((element) => !element.closest('.spy-assistant') && !element.disabled && !element.readOnly && isVisible(element))
    .map((element) => ({ element, name: getAccessibleName(element) }))
    .filter(({ name }) => name && (name === needle || name.includes(needle) || needle.includes(name)))
    .sort((a, b) => Number(b.name === needle) - Number(a.name === needle));
  if (!matches.length) return { error: `I couldn’t find a visible control called ${query}.` };
  const exactMatches = matches.filter(({ name }) => name === needle);
  if (exactMatches.length > 1 || (!exactMatches.length && matches.length > 1)) {
    return { error: `I found more than one control called ${query}. Please say a more specific name.` };
  }
  return { element: matches[0].element };
};
const setElementValue = (element, value) => {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(element, value);
  else element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};
const consequentialControl = (element, label) => element.matches('button[type="submit"], input[type="submit"]')
  || Boolean(element.matches('label') && element.control && ['checkbox', 'radio'].includes(element.control.type))
  || /\b(pay|delete|remove|refund|save|submit|send|redeem|enable|enabled|disable|disabled|logout|sync|invite|add|cancel|register|login|continue|resolve|raise|confirm)\b|भुगतान|हटाएं|मिटाएं|भेजें|रद्द|जोड़ें|सहेजें|పేమెంట్|చెల్లించు|తొలగించు|సమర్పించు|రద్దు|జోడించు|నిర్ధారించు/i.test(`${label} ${getAccessibleName(element)}`);
const pages = [
  { names: ['dashboard', 'home', 'डैशबोर्ड', 'मुख्य पृष्ठ', 'హోమ్', 'డ్యాష్‌బోర్డ్'], path: '/dashboard', label: { hi: 'डैशबोर्ड', te: 'డ్యాష్‌బోర్డ్' } },
  { names: ['bills', 'bill', 'बिल', 'बिलों', 'బిల్లు', 'బిల్లులు'], path: '/bills', label: { hi: 'बिल', te: 'బిల్లులు' } },
  { names: ['payments', 'payment history', 'transactions', 'भुगतान', 'भुगतान इतिहास', 'చెల్లింపులు', 'చెల్లింపుల చరిత్ర'], path: '/payments', label: { hi: 'भुगतान', te: 'చెల్లింపులు' } },
  { names: ['usage', 'consumption', 'analytics', 'उपयोग', 'विश्लेषण', 'వినియోగం', 'విశ్లేషణ'], path: '/usage' },
  { names: ['autopay', 'automatic payments', 'ऑटो पे', 'ఆటో పే'], path: '/autopay' },
  { names: ['predictions', 'forecast', 'पूर्वानुमान', 'అంచనా'], path: '/predictions' },
  { names: ['disputes', 'raise a dispute', 'शिकायत', 'వివాదాలు'], path: '/disputes' },
  { names: ['notifications', 'alerts', 'सूचनाएं', 'నోటిఫికేషన్లు'], path: '/notifications' },
  { names: ['loyalty', 'rewards', 'points', 'इनाम', 'రివార్డులు'], path: '/loyalty' },
  { names: ['profile', 'account', 'settings', 'प्रोफ़ाइल', 'सेटिंग्स', 'ఖాతా', 'సెట్టింగ్స్'], path: '/profile' },
  { names: ['household', 'परिवार', 'ఇల్లు'], path: '/household' },
  { names: ['members', 'household members', 'सदस्य', 'సభ్యులు'], path: '/members' },
  { names: ['utilities', 'उपयोगिताएं', 'యుటిలిటీలు'], path: '/utilities' },
  { names: ['splits', 'split', 'split bill', 'बांटें', 'बिल बांटें', 'విభజనలు', 'బిల్లు విభజించు'], path: '/splits' },
  { names: ['reports', 'report', 'रिपोर्ट', 'నివేదికలు'], path: '/reports' },
  { names: ['customer care', 'support', 'help', 'सहायता', 'మద్దతు'], path: '/customer-care' },
  { names: ['account services', 'खाता सेवाएं', 'ఖాతా సేవలు'], path: '/account-services' },
  { names: ['admin users', 'users', 'उपयोगकर्ता', 'వినియోగదారులు'], path: '/admin/users' },
  { names: ['admin households', 'all households', 'सभी परिवार', 'అన్ని గృహాలు'], path: '/admin/households' },
  { names: ['admin bills', 'बिल प्रबंधन', 'బిల్లుల నిర్వహణ'], path: '/admin/bills' },
  { names: ['admin payments', 'भुगतान प्रबंधन', 'చెల్లింపుల నిర్వహణ'], path: '/admin/payments' },
  { names: ['admin disputes', 'शिकायत प्रबंधन', 'వివాదాల నిర్వహణ'], path: '/admin/disputes' },
  { names: ['admin reports', 'रिपोर्ट प्रबंधन', 'నివేదికల నిర్వహణ'], path: '/admin/reports' },
  { names: ['admin', 'administration', 'overview', 'प्रशासन', 'నిర్వహణ'], path: '/admin' },
];
const roles = {
  '/household': ['HOUSEHOLD_ADMIN', 'HOUSEHOLD_MEMBER'],
  '/members': ['HOUSEHOLD_ADMIN'], '/utilities': ['HOUSEHOLD_ADMIN'], '/splits': ['HOUSEHOLD_ADMIN'], '/reports': ['HOUSEHOLD_ADMIN'],
  '/customer-care': ['HOUSEHOLD_ADMIN', 'HOUSEHOLD_MEMBER'], '/account-services': ['HOUSEHOLD_ADMIN', 'HOUSEHOLD_MEMBER'],
  '/admin': ['PLATFORM_ADMIN'], '/admin/users': ['PLATFORM_ADMIN'], '/admin/households': ['PLATFORM_ADMIN'],
  '/admin/bills': ['PLATFORM_ADMIN'], '/admin/payments': ['PLATFORM_ADMIN'], '/admin/disputes': ['PLATFORM_ADMIN'], '/admin/reports': ['PLATFORM_ADMIN'],
};
const routeLabels = {
  '/usage': ['analytics', 'विश्लेषण', 'విశ్లేషణ'], '/autopay': ['autopay', 'ऑटो पे', 'ఆటో పే'],
  '/predictions': ['predictions', 'पूर्वानुमान', 'అంచనాలు'], '/disputes': ['disputes', 'शिकायतें', 'వివాదాలు'],
  '/notifications': ['notifications', 'सूचनाएं', 'నోటిఫికేషన్లు'], '/loyalty': ['rewards', 'इनाम', 'రివార్డులు'],
  '/profile': ['settings', 'सेटिंग्स', 'సెట్టింగ్స్'], '/household': ['household', 'परिवार', 'కుటుంబం'],
  '/members': ['members', 'सदस्य', 'సభ్యులు'], '/utilities': ['utilities', 'उपयोगिताएं', 'యుటిలిటీలు'],
  '/splits': ['splits', 'बिल विभाजन', 'బిల్లు విభజనలు'], '/reports': ['reports', 'रिपोर्टें', 'నివేదికలు'],
  '/customer-care': ['customer care', 'ग्राहक सहायता', 'కస్టమర్ సహాయం'], '/account-services': ['account services', 'खाता सेवाएं', 'ఖాతా సేవలు'],
  '/admin': ['admin overview', 'प्रशासन', 'నిర్వహణ'], '/admin/users': ['admin users', 'उपयोगकर्ता प्रबंधन', 'వినియోగదారుల నిర్వహణ'],
  '/admin/households': ['admin households', 'परिवार प्रबंधन', 'గృహాల నిర్వహణ'], '/admin/bills': ['admin bills', 'बिल प्रबंधन', 'బిల్లుల నిర్వహణ'],
  '/admin/payments': ['admin payments', 'भुगतान प्रबंधन', 'చెల్లింపుల నిర్వహణ'], '/admin/disputes': ['admin disputes', 'शिकायत प्रबंधन', 'వివాదాల నిర్వహణ'],
  '/admin/reports': ['admin reports', 'प्रशासन रिपोर्टें', 'నిర్వహణ నివేదికలు'],
};

const appQuestions = [
  {
    match: /\b(what is paymate|what does (this )?app do|about (the )?app|how does paymate work|what can paymate do)\b|पेमेट क्या|पेमेंट ऐप क्या|यह ऐप क्या|ऐप कैसे काम|पे मेट क्या|పేమేట్ అంటే ఏమి|ఈ యాప్ ఏమి చేస్తుంది|యాప్ ఎలా పని చేస్తుంది/i,
    en: 'PAYMATE helps you manage household utility bills in one place. You can view bills, make and review payments, split expenses, track usage, manage autopay, and get alerts and predictions. The pages available depend on your account role.',
    hi: 'PAYMATE घर के उपयोगिता बिलों को एक जगह पर संभालने में मदद करता है। आप बिल देख सकते हैं, भुगतान कर सकते हैं और उनका इतिहास देख सकते हैं, खर्च बाँट सकते हैं, उपयोग की जानकारी देख सकते हैं, ऑटोपे संभाल सकते हैं और सूचनाएँ व अनुमान पा सकते हैं। उपलब्ध पेज आपके खाते की भूमिका पर निर्भर करते हैं।',
    te: 'PAYMATE ఇంటి యుటిలిటీ బిల్లులను ఒకేచోట నిర్వహించడంలో సహాయపడుతుంది. మీరు బిల్లులు చూడవచ్చు, చెల్లింపులు చేయవచ్చు మరియు వాటి చరిత్రను చూడవచ్చు, ఖర్చులను పంచుకోవచ్చు, వినియోగాన్ని ట్రాక్ చేయవచ్చు, ఆటోపే నిర్వహించవచ్చు, నోటిఫికేషన్లు మరియు అంచనాలు పొందవచ్చు. మీ ఖాతా పాత్రను బట్టి పేజీలు అందుబాటులో ఉంటాయి.',
  },
  {
    match: /\b(how (do|can) i (view|find|manage|pay) (a |my |the )?bills?|how to pay (a |my |the )?bill|where (are|can i find) my bills|bill page help)\b|बिल कैसे देखें|बिल कैसे भरें|बिल कैसे चुकाएँ|बिल का भुगतान कैसे|मेरा बिल कहाँ|बिल पेज|బిల్లు ఎలా చూడ|బిల్లు ఎలా చెల్లించ|నా బిల్లు ఎక్కడ|బిల్లుల పేజీ/i,
    en: 'Open Bills to see your household bills, amounts, due dates, and payment status. Choose an unpaid bill to view its details and payment options. Spy asks you to confirm before submitting a payment.',
    hi: 'अपने घर के बिल, राशि, अंतिम तिथि और भुगतान की स्थिति देखने के लिए बिल पेज खोलें। किसी बकाया बिल को चुनकर उसका विवरण और भुगतान विकल्प देखें। भुगतान भेजने से पहले Spy आपसे पुष्टि माँगता है।',
    te: 'మీ ఇంటి బిల్లులు, మొత్తాలు, గడువు తేదీలు మరియు చెల్లింపు స్థితిని చూడటానికి బిల్లుల పేజీని తెరవండి. బకాయి బిల్లును ఎంచుకుని దాని వివరాలు మరియు చెల్లింపు ఎంపికలను చూడండి. చెల్లింపును సమర్పించే ముందు Spy మీ నిర్ధారణ అడుగుతుంది.',
  },
  {
    match: /\b(how (do|can) i (see|view|check) (my )?(payment history|transactions)|where (are|is) my payments|payment page help)\b|भुगतान इतिहास कैसे|मेरे भुगतान कहाँ|लेनदेन कैसे देखें|చెల్లింపు చరిత్ర ఎలా|నా చెల్లింపులు ఎక్కడ|లావాదేవీలు ఎలా చూడ/i,
    en: 'Open Payments to review recorded transactions and their statuses. You can also ask Spy to show payment history or tell you about your latest payment.',
    hi: 'दर्ज किए गए लेनदेन और उनकी स्थिति देखने के लिए भुगतान पेज खोलें। Spy से भुगतान इतिहास दिखाने या हाल के भुगतान की जानकारी देने को भी कह सकते हैं।',
    te: 'నమోదైన లావాదేవీలు మరియు వాటి స్థితిని చూడటానికి చెల్లింపుల పేజీని తెరవండి. చెల్లింపు చరిత్ర చూపించమని లేదా తాజా చెల్లింపు వివరాలు చెప్పమని Spyని అడగవచ్చు.',
  },
  {
    match: /\b(what is split bill|how (do|can) i split (a |the )?bill|share (a |the )?bill|split expenses)\b|బిల్లు ఎలా పంచ|ఖర్చు ఎలా పంచ|స్ప్లిట్ బిల్ అంటే ఏమి|बिल कैसे बाँट|खर्च कैसे बाँट|स्प्लिट बिल क्या/i,
    en: 'Split Bill lets a household admin divide a bill among household members. Open Split Bill, choose the bill and members, then review the shares before saving.',
    hi: 'स्प्लिट बिल से घर का एडमिन किसी बिल का हिस्सा सदस्यों में बाँट सकता है। स्प्लिट बिल खोलें, बिल और सदस्यों को चुनें, फिर सेव करने से पहले हिस्सों की जाँच करें।',
    te: 'స్ప్లిట్ బిల్ ద్వారా ఇంటి అడ్మిన్ బిల్లును సభ్యుల మధ్య పంచవచ్చు. స్ప్లిట్ బిల్ తెరిచి, బిల్లు మరియు సభ్యులను ఎంచుకుని, సేవ్ చేయడానికి ముందు వాటాలను పరిశీలించండి.',
  },
  {
    match: /\b(what is usage|usage analytics|how (do|can) i track (my )?(usage|consumption)|where can i see (my )?usage|analytics help)\b|వినియోగం ఎలా చూడ|వినియోగ విశ్లేషణ|వినియోగాన్ని ఎలా ట్రాక్|उपयोग कैसे देखें|खपत कैसे देखें|उपयोग विश्लेषण/i,
    en: 'Usage or Analytics shows utility consumption trends and related summaries. Open Analytics to review the information available for your household.',
    hi: 'उपयोग या एनालिटिक्स पेज पर उपयोगिता की खपत के रुझान और सारांश मिलते हैं। अपने घर की उपलब्ध जानकारी देखने के लिए एनालिटिक्स खोलें।',
    te: 'వినియోగం లేదా అనలిటిక్స్ పేజీలో యుటిలిటీ వినియోగ ధోరణులు మరియు సారాంశాలు ఉంటాయి. మీ ఇంటికి అందుబాటులో ఉన్న వివరాలను చూడటానికి అనలిటిక్స్ తెరవండి.',
  },
  {
    match: /\b(what is autopay|how (do|can) i (set up|manage|turn on) autopay|automatic payment help)\b|ऑटोपे क्या|ऑटोपे कैसे|स्वचालित भुगतान कैसे|ఆటోపే అంటే ఏమి|ఆటోపే ఎలా|ఆటోమేటిక్ చెల్లింపు/i,
    en: 'Autopay lets you manage automatic bill payments. Open Autopay to review its settings. Check the selected account and schedule carefully, and confirm before enabling or changing it.',
    hi: 'ऑटोपे से आप बिलों के स्वचालित भुगतान संभाल सकते हैं। इसकी सेटिंग देखने के लिए ऑटोपे खोलें। इसे चालू या बदलने से पहले चुने गए खाते और समय-सारणी की जाँच करें और पुष्टि करें।',
    te: 'ఆటోపే ద్వారా బిల్లుల ఆటోమేటిక్ చెల్లింపులను నిర్వహించవచ్చు. సెట్టింగులను చూడటానికి ఆటోపే తెరవండి. దాన్ని ప్రారంభించే లేదా మార్చే ముందు ఎంచుకున్న ఖాతా మరియు షెడ్యూల్‌ను పరిశీలించి నిర్ధారించండి.',
  },
  {
    match: /\b(what are predictions|bill prediction|how much will my next bill|forecast help|predict my bill)\b|बिल का अनुमान|आने वाला बिल कितना|पूर्वानुमान क्या|తదుపరి బిల్లు ఎంత|బిల్లు అంచనా|అంచనాలు అంటే ఏమి/i,
    en: 'Predictions provides estimates based on the usage and bill information available to PAYMATE. Open Predictions to review the current forecast; estimates can differ from your final provider bill.',
    hi: 'प्रेडिक्शन पेज PAYMATE में उपलब्ध उपयोग और बिल की जानकारी के आधार पर अनुमान देता है। मौजूदा अनुमान देखने के लिए प्रेडिक्शन खोलें। अंतिम प्रदाता बिल इससे अलग हो सकता है।',
    te: 'PAYMATEలో అందుబాటులో ఉన్న వినియోగం మరియు బిల్లు వివరాల ఆధారంగా ప్రిడిక్షన్స్ అంచనాలను చూపిస్తుంది. ప్రస్తుత అంచనాను చూడటానికి ప్రిడిక్షన్స్ తెరవండి. ప్రొవైడర్ ఇచ్చే తుది బిల్లు దీనికి భిన్నంగా ఉండవచ్చు.',
  },
  {
    match: /\b(what is a dispute|how (do|can) i (raise|report|track) a dispute|bill is wrong|incorrect bill)\b|विवाद कैसे दर्ज|गलत बिल की शिकायत|शिकायत कैसे दर्ज|వివాదం ఎలా|తప్పు బిల్లు ఫిర్యాదు|ఫిర్యాదు ఎలా చేయ/i,
    en: 'Use Disputes to report a bill or payment issue and review its status. Open Disputes, provide the requested details, and submit the request. Contact Customer Care if you need more help.',
    hi: 'बिल या भुगतान की समस्या दर्ज करने और उसकी स्थिति देखने के लिए विवाद पेज खोलें। माँगी गई जानकारी भरकर अनुरोध भेजें। अधिक सहायता के लिए कस्टमर केयर खोलें।',
    te: 'బిల్లు లేదా చెల్లింపు సమస్యను నమోదు చేసి దాని స్థితిని చూడటానికి వివాదాల పేజీని ఉపయోగించండి. అడిగిన వివరాలు ఇచ్చి అభ్యర్థనను సమర్పించండి. మరింత సహాయం కోసం కస్టమర్ కేర్‌ను తెరవండి.',
  },
  {
    match: /\b(what are notifications|where are my alerts|notification settings|how do notifications work)\b|सूचनाएँ कहाँ|अलर्ट कहाँ|नोटिफिकेशन क्या|నోటిఫికేషన్లు ఎక్కడ|అలర్ట్స్ ఎక్కడ|నోటిఫికేషన్ అంటే ఏమి/i,
    en: 'Notifications keeps bill, payment, and account alerts together. Open Notifications to review the alerts available to your account.',
    hi: 'नोटिफिकेशन में बिल, भुगतान और खाते से जुड़ी सूचनाएँ मिलती हैं। अपने खाते के लिए उपलब्ध अलर्ट देखने के लिए नोटिफिकेशन खोलें।',
    te: 'నోటిఫికేషన్లలో బిల్లు, చెల్లింపు మరియు ఖాతా అలర్ట్‌లు కనిపిస్తాయి. మీ ఖాతాకు అందుబాటులో ఉన్న అలర్ట్‌లను చూడటానికి నోటిఫికేషన్లు తెరవండి.',
  },
  {
    match: /\b(what is loyalty|how do rewards work|where are my points|rewards help)\b|రివార్డులు ఎలా|పాయింట్లు ఎక్కడ|లాయల్టీ అంటే ఏమి|रिवॉर्ड कैसे|पॉइंट कहाँ|लॉयल्टी क्या/i,
    en: 'Loyalty shows the rewards or points associated with your account. Open Loyalty to check your current balance and available reward details.',
    hi: 'लॉयल्टी पेज पर आपके खाते से जुड़े रिवॉर्ड या पॉइंट दिखते हैं। मौजूदा बैलेंस और उपलब्ध रिवॉर्ड देखने के लिए लॉयल्टी खोलें।',
    te: 'లాయల్టీ పేజీలో మీ ఖాతాకు సంబంధించిన రివార్డులు లేదా పాయింట్లు కనిపిస్తాయి. ప్రస్తుత బ్యాలెన్స్ మరియు అందుబాటులో ఉన్న రివార్డులను చూడటానికి లాయల్టీ తెరవండి.',
  },
  {
    match: /\b(how do i change (my )?(profile|settings|account)|where are settings|edit my profile|account settings help)\b|సెట్టింగులు ఎక్కడ|ప్రొఫైల్ ఎలా మార్చ|ఖాతా వివరాలు ఎలా|सेटिंग कहाँ|प्रोफ़ाइल कैसे बदलें|खाता जानकारी/i,
    en: 'Open Profile or Settings to review your account details and available preferences. Some account options are limited to household admins or platform admins.',
    hi: 'खाते की जानकारी और उपलब्ध प्राथमिकताएँ देखने के लिए प्रोफ़ाइल या सेटिंग खोलें। कुछ विकल्प केवल घर के एडमिन या प्लेटफ़ॉर्म एडमिन के लिए होते हैं।',
    te: 'ఖాతా వివరాలు మరియు అందుబాటులో ఉన్న ప్రాధాన్యతలను చూడటానికి ప్రొఫైల్ లేదా సెట్టింగ్స్ తెరవండి. కొన్ని ఎంపికలు ఇంటి అడ్మిన్ లేదా ప్లాట్‌ఫారమ్ అడ్మిన్‌కు మాత్రమే అందుబాటులో ఉంటాయి.',
  },
  {
    match: /\b(how do i add (a )?member|manage (my )?household|household members|who can manage utilities)\b|సభ్యుడిని ఎలా జోడించ|ఇంటి సభ్యులు|ఇంటిని ఎలా నిర్వహించ|యుటిలిటీలను ఎవరు నిర్వహి|सदस्य कैसे जोड़ें|घर के सदस्य|घर कैसे संभालें/i,
    en: 'Household admins can manage household members and utility settings. Open Household or Members to review those options. Members can see the pages allowed for their role.',
    hi: 'घर के एडमिन सदस्य और उपयोगिता सेटिंग संभाल सकते हैं। इन विकल्पों को देखने के लिए घर या सदस्य पेज खोलें। सदस्य अपनी भूमिका के अनुसार उपलब्ध पेज देख सकते हैं।',
    te: 'ఇంటి అడ్మిన్‌లు సభ్యులు మరియు యుటిలిటీ సెట్టింగులను నిర్వహించగలరు. ఆ ఎంపికలను చూడటానికి ఇల్లు లేదా సభ్యుల పేజీని తెరవండి. సభ్యులకు వారి పాత్రకు అనుమతించిన పేజీలు కనిపిస్తాయి.',
  },
  {
    match: /\b(what is utilities|manage (my )?utilities|utility settings|add a utility|utility providers)\b|यूटिलिटी कैसे|उपयोगिता सेटिंग|बिजली पानी गैस|యుటిలిటీలు ఎలా|యుటిలిటీ సెట్టింగులు|కరెంటు నీరు గ్యాస్/i,
    en: 'Utilities is where household admins review the services and providers linked to the household. Open Utilities to see which options are available to your account.',
    hi: 'यूटिलिटी पेज पर घर के एडमिन घर से जुड़ी सेवाएँ और प्रदाता देखते हैं। आपके खाते में उपलब्ध विकल्प देखने के लिए यूटिलिटी खोलें।',
    te: 'యుటిలిటీస్ పేజీలో ఇంటికి అనుసంధానించిన సేవలు మరియు ప్రొవైడర్లను ఇంటి అడ్మిన్‌లు పరిశీలిస్తారు. మీ ఖాతాకు అందుబాటులో ఉన్న ఎంపికలను చూడటానికి యుటిలిటీస్ తెరవండి.',
  },
  {
    match: /\b(customer care|contact support|how do i get help|need help|support page)\b|सहायता कैसे|कस्टमर केयर|मदद कहाँ|సహాయం ఎలా|కస్టమర్ కేర్|సపోర్ట్ ఎక్కడ/i,
    en: 'Open Customer Care to find the support options available in PAYMATE. For a bill-specific issue, you can also open Disputes and submit the bill details.',
    hi: 'PAYMATE में उपलब्ध सहायता विकल्प देखने के लिए कस्टमर केयर खोलें। किसी खास बिल की समस्या के लिए विवाद पेज खोलकर बिल का विवरण भेज सकते हैं।',
    te: 'PAYMATEలో అందుబాటులో ఉన్న సహాయ ఎంపికలను చూడటానికి కస్టమర్ కేర్ తెరవండి. నిర్దిష్ట బిల్లు సమస్య కోసం వివాదాల పేజీని తెరిచి బిల్లు వివరాలను సమర్పించవచ్చు.',
  },
  {
    match: /\b(account services|what are account services|manage account services|account service help)\b|खाता सेवाएँ क्या|खाता सेवा|खाते की सेवाएँ|ఖాతా సేవలు ఏమి|ఖాతా సేవల సహాయం/i,
    en: 'Account Services contains the account-related tools available to your role. Open Account Services to review those tools; some actions may require confirmation or admin access.',
    hi: 'खाता सेवाओं में आपकी भूमिका के लिए उपलब्ध खाते से जुड़े टूल होते हैं। उन्हें देखने के लिए खाता सेवाएँ खोलें। कुछ कार्रवाइयों के लिए पुष्टि या एडमिन अनुमति चाहिए।',
    te: 'ఖాతా సేవల్లో మీ పాత్రకు అందుబాటులో ఉన్న ఖాతా సంబంధిత సాధనాలు ఉంటాయి. వాటిని చూడటానికి ఖాతా సేవలు తెరవండి. కొన్ని చర్యలకు నిర్ధారణ లేదా అడ్మిన్ అనుమతి అవసరం.',
  },
  {
    match: /\b(admin page|admin dashboard|what can an admin do|admin features|admin tools)\b|एडमिन क्या कर|एडमिन डैशबोर्ड|प्रशासक सुविधाएँ|అడ్మిన్ ఏమి చేయ|అడ్మిన్ డాష్‌బోర్డ్|నిర్వాహక సాధనాలు/i,
    en: 'Admin pages depend on your role. Household admins can manage members, utilities, splits, and household reports. Platform admins have separate management pages for users, households, bills, payments, disputes, and reports.',
    hi: 'एडमिन पेज आपकी भूमिका पर निर्भर करते हैं। घर के एडमिन सदस्य, यूटिलिटी, बिल विभाजन और घर की रिपोर्ट संभाल सकते हैं। प्लेटफ़ॉर्म एडमिन के लिए उपयोगकर्ता, घर, बिल, भुगतान, विवाद और रिपोर्ट के अलग प्रबंधन पेज हैं।',
    te: 'అడ్మిన్ పేజీలు మీ పాత్రపై ఆధారపడి ఉంటాయి. ఇంటి అడ్మిన్‌లు సభ్యులు, యుటిలిటీలు, బిల్లు విభజనలు మరియు ఇంటి నివేదికలను నిర్వహించగలరు. ప్లాట్‌ఫారమ్ అడ్మిన్‌లకు వినియోగదారులు, గృహాలు, బిల్లులు, చెల్లింపులు, వివాదాలు మరియు నివేదికల కోసం ప్రత్యేక నిర్వహణ పేజీలు ఉంటాయి.',
  },
  {
    match: /\b(how do i change (the )?theme|dark mode|light mode|switch theme|theme setting)\b|థీమ్ ఎలా మార్చ|డార్క్ మోడ్|లైట్ మోడ్|రంగుల థీమ్|थीम कैसे बदलें|डार्क मोड|लाइट मोड/i,
    en: 'Use the Light or Dark button in the top bar to switch themes. PAYMATE remembers your choice in this browser and keeps it as you move between pages.',
    hi: 'थीम बदलने के लिए ऊपर के बार में Light या Dark बटन दबाएँ। PAYMATE इस ब्राउज़र में आपकी पसंद याद रखता है और पेज बदलने पर भी लागू रखता है।',
    te: 'థీమ్ మార్చడానికి పై బార్‌లోని Light లేదా Dark బటన్‌ను నొక్కండి. PAYMATE ఈ బ్రౌజర్‌లో మీ ఎంపికను గుర్తుంచుకుని, పేజీలు మారినా అలాగే ఉంచుతుంది.',
  },
  {
    match: /\b(what languages does spy support|can spy speak hindi|can spy speak telugu|how do i change (spy'?s? )?language|voice assistant language)\b|स्पाई कौन सी भाषा|स्पाई हिंदी|भाषा कैसे बदलें|స్పై ఏ భాషలు|స్పై తెలుగు|భాష ఎలా మార్చ/i,
    en: 'Spy supports English, Hindi, and Telugu. Choose a language from the Language menu in Spy, then tap Talk to Spy and ask your question or give a page command.',
    hi: 'Spy अंग्रेज़ी, हिंदी और तेलुगु में काम करता है। Spy में भाषा मेन्यू से भाषा चुनें, फिर Talk to Spy दबाकर सवाल पूछें या पेज खोलने का निर्देश दें।',
    te: 'Spy ఇంగ్లీష్, హిందీ మరియు తెలుగు భాషలకు మద్దతు ఇస్తుంది. Spyలో Language మెనూ నుంచి భాషను ఎంచుకుని, Talk to Spy నొక్కి ప్రశ్న అడగండి లేదా పేజీ తెరవమని చెప్పండి.',
  },
  {
    match: /\b(is my payment safe|is this app secure|why does spy ask me to confirm|payment security|is spy allowed to pay)\b|भुगतान सुरक्षित|पुष्टि क्यों माँगता|ऐप सुरक्षित|చెల్లింపు సురక్షిత|నిర్ధారణ ఎందుకు|యాప్ సురక్షిత/i,
    en: 'Spy asks for confirmation before consequential actions such as making a payment or submitting a form. Review the bill, amount, and action in the app before you confirm. Never share your password or one-time code with Spy.',
    hi: 'भुगतान या फ़ॉर्म भेजने जैसी महत्वपूर्ण कार्रवाई से पहले Spy पुष्टि माँगता है। पुष्टि करने से पहले ऐप में बिल, राशि और कार्रवाई जाँचें। अपना पासवर्ड या वन-टाइम कोड Spy के साथ साझा न करें।',
    te: 'చెల్లింపు లేదా ఫారమ్ సమర్పణ వంటి ముఖ్యమైన చర్యలకు ముందు Spy నిర్ధారణ అడుగుతుంది. నిర్ధారించే ముందు యాప్‌లో బిల్లు, మొత్తం మరియు చర్యను పరిశీలించండి. మీ పాస్‌వర్డ్ లేదా వన్-టైమ్ కోడ్‌ను Spyతో పంచుకోవద్దు.',
  },
];

export const VoiceAssistant = ({ user }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState(() => getLanguagePreference(user?.id));
  const [message, setMessage] = useState(() => localizedText(
    getLanguagePreference(user?.id),
    'Hi! I’m Spy. I can open app pages, operate labeled controls, fill forms, and help with bills.',
    'नमस्ते! मैं Spy हूँ। मैं पेज खोल सकता हूँ, नियंत्रण चला सकता हूँ, फ़ॉर्म भर सकता हूँ और बिलों में मदद कर सकता हूँ।',
    'నమస్కారం! నేను Spy. పేజీలు తెరవగలను, నియంత్రణలను ఉపయోగించగలను, ఫారమ్‌లు నింపగలను మరియు బిల్లులలో సహాయం చేయగలను.',
  ));
  const [error, setError] = useState('');
  const [pendingBill, setPendingBill] = useState(null);
  const [pendingAction, setPendingAction] = useState('');
  const [busy, setBusy] = useState(false);
  const recognitionRef = useRef(null);
  const pendingActionRef = useRef(null);
  const startListeningRef = useRef(null);
  const role = user?.role;

  const localized = (english, hindi, telugu) => localizedText(language, english, hindi, telugu);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
    window.speechSynthesis?.cancel?.();
  }, []);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    const openAndListen = () => {
      setOpen(true);
      startListeningRef.current?.();
    };
    window.addEventListener('spy-assistant:open', openAssistant);
    window.addEventListener('spy-assistant:listen', openAndListen);
    return () => {
      window.removeEventListener('spy-assistant:open', openAssistant);
      window.removeEventListener('spy-assistant:listen', openAndListen);
    };
  }, []);

  const speak = (text, speechLanguage = language) => {
    setMessage(text);
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = speechLanguage;
    window.speechSynthesis.speak(utterance);
  };

  const selectLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setError('');
    try {
      window.localStorage.setItem(`spy-language:${user?.id || 'default'}`, nextLanguage);
    } catch {
      setError(localizedText(nextLanguage, 'Your language choice could not be saved in this browser.', 'इस ब्राउज़र में आपकी भाषा पसंद सहेजी नहीं जा सकी।', 'ఈ బ్రౌజర్‌లో మీ భాష ఎంపికను సేవ్ చేయలేకపోయాము.'));
    }
    speak(localizedText(nextLanguage,
      'Language set to English.',
      'भाषा हिंदी पर सेट कर दी गई है।',
      'భాష తెలుగుకు మార్చబడింది.',
    ), nextLanguage);
  };

  const payBill = async (bill) => {
    setBusy(true);
    try {
      const created = await paymentService.createPayment({ billId: bill.id, amount: bill.amount });
      await paymentService.process({ paymentId: created.data.data.payment.id });
      setPendingBill(null);
      speak(localized(
        `Payment started for your ${String(bill.utilityType).toLowerCase()} bill of ${money(bill.amount)}. You can check its status on the payments page.`,
        `${String(bill.utilityType).toLowerCase()} बिल के ${money(bill.amount)} का भुगतान शुरू हो गया है। इसकी स्थिति भुगतान पेज पर देखें।`,
        `${String(bill.utilityType).toLowerCase()} బిల్లు ${money(bill.amount)} చెల్లింపు ప్రారంభమైంది. చెల్లింపుల పేజీలో స్థితిని చూడండి.`,
      ));
    } catch {
      speak(localized('I couldn’t start that payment. Please open the bill and try again.', 'भुगतान शुरू नहीं हो पाया। कृपया बिल खोलकर फिर कोशिश करें।', 'చెల్లింపును ప్రారంభించలేకపోయాను. బిల్లును తెరిచి మళ్లీ ప్రయత్నించండి.'));
    } finally {
      setBusy(false);
    }
  };

  const runControlCommand = (text, rawText) => {
    if (/^(scroll|page) (down|up|top|bottom)$/.test(text)) {
      if (text.endsWith('down')) window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      else if (text.endsWith('up')) window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      else window.scrollTo({ top: text.endsWith('top') ? 0 : document.documentElement.scrollHeight, behavior: 'smooth' });
      const direction = text.split(' ').at(-1);
      speak(localized(`Scrolling ${direction}.`, `${direction === 'top' ? 'ऊपर' : direction === 'bottom' ? 'नीचे' : direction === 'up' ? 'ऊपर' : 'नीचे'} जा रहा हूँ।`, `${direction === 'top' ? 'పైకి' : direction === 'bottom' ? 'కిందికి' : direction === 'up' ? 'పైకి' : 'కిందికి'} వెళ్తున్నాను.`));
      return true;
    }
    if (/^(go )?back$|^(पीछे जाएं|वापस जाएं|पीछे जाओ|वापस जाओ|వెనక్కి వెళ్ళు|వెనక్కి వెళ్లండి)$/u.test(text)) {
      navigate(-1);
      speak(localized('Going back.', 'पिछले पेज पर जा रहा हूँ।', 'వెనుక పేజీకి వెళ్తున్నాను.'));
      return true;
    }
    if (/^(go )?forward$|^(आगे जाएं|आगे जाओ|ముందుకు వెళ్ళు|ముందుకు వెళ్లండి)$/u.test(text)) {
      navigate(1);
      speak(localized('Going forward.', 'अगले पेज पर जा रहा हूँ।', 'తదుపరి పేజీకి వెళ్తున్నాను.'));
      return true;
    }
    if (/^(read|describe) (this )?page$|^what is on this page$|^list (the )?controls$|^(पेज पढ़ो|पेज पढ़ें|इस पेज पर क्या है|नियंत्रण बताओ|ఈ పేజీ చదువు|పేజీలో ఏముంది|నియంత్రణలు చెప్పు)$/u.test(text)) {
      const headings = [...document.querySelectorAll('h1, h2, h3')].filter(isVisible).map(getAccessibleName).filter(Boolean).slice(0, 5);
      const controls = [...document.querySelectorAll('button, a[href], [role="button"], input, select, textarea')]
        .map(getAccessibleName).filter(Boolean).slice(0, 8);
      const summary = `${headings.length ? `the headings ${headings.join(', ')}. ` : ''}${controls.length ? `Available controls include ${controls.join(', ')}.` : 'No labeled controls are visible.'}`;
      speak(localized(`This page has ${summary}`, `इस पेज पर ${headings.length ? `शीर्षक ${headings.join(', ')} हैं। ` : ''}${controls.length ? `उपलब्ध नियंत्रण ${controls.join(', ')} हैं।` : 'कोई लेबल वाला नियंत्रण नहीं दिख रहा है।'}`, `ఈ పేజీలో ${headings.length ? `శీర్షికలు ${headings.join(', ')}. ` : ''}${controls.length ? `అందుబాటులో ఉన్న నియంత్రణలు ${controls.join(', ')}.` : 'లేబుల్ ఉన్న నియంత్రణలు కనిపించడం లేదు.'}`));
      return true;
    }

    const colors = { red: '#e5484d', orange: '#f08c35', yellow: '#e5b93d', green: '#268c5b', blue: '#3975dc', purple: '#7657e8', pink: '#e56ca8', teal: '#2dbda6', black: '#24212e', white: '#ffffff', gray: '#85818f', grey: '#85818f' };
    const styleCommand = rawText.match(/^(?:set|change)\s+(background|background color|text color|font color)\s+of\s+(.+?)\s+to\s+(red|orange|yellow|green|blue|purple|pink|teal|black|white|gray|grey)$/i);
    if (styleCommand) {
      const [, property, target, color] = styleCommand;
      const result = findControl('button, a[href], [role], input, select, textarea, label, article, section, table, tr, td, th, li, img[alt], h1, h2, h3, p', target);
      if (result.error) speak(localizeControlError(result.error, language));
      else {
        const cssProperty = property.toLowerCase().startsWith('background') ? 'backgroundColor' : 'color';
        result.element.style[cssProperty] = colors[color.toLowerCase()];
        speak(localized(`Changed the ${property} of ${target} to ${color}.`, `${target} का ${property} रंग ${color} कर दिया।`, `${target} యొక్క ${property} రంగును ${color}గా మార్చాను.`));
      }
      return true;
    }

    const dimensionCommand = rawText.match(/^(?:set|change)\s+(width|height|padding|margin|border radius|opacity)\s+of\s+(.+?)\s+to\s+(\d{1,4}(?:\.\d+)?)\s*(px|pixels?|percent|%)?$/i);
    if (dimensionCommand) {
      const [, spokenProperty, target, spokenValue, spokenUnit = ''] = dimensionCommand;
      const property = { 'border radius': 'borderRadius' }[spokenProperty.toLowerCase()] || spokenProperty.toLowerCase();
      const number = Number(spokenValue);
      const percent = /percent|%/i.test(spokenUnit);
      if (property === 'opacity' && number > 100) {
        speak(localized('Opacity must be between zero and one hundred percent.', 'अपारदर्शिता शून्य से सौ प्रतिशत के बीच होनी चाहिए।', 'అపారదర్శకత సున్నా నుంచి వంద శాతం మధ్య ఉండాలి.'));
        return true;
      }
      if (number > 1000) {
        speak(localized('That value is too large. Please use a value from zero to one thousand.', 'यह मान बहुत बड़ा है। कृपया शून्य से एक हज़ार के बीच मान दें।', 'ఆ విలువ చాలా ఎక్కువ. దయచేసి సున్నా నుంచి వెయ్యి మధ్య విలువ ఇవ్వండి.'));
        return true;
      }
      const result = findControl('button, a[href], [role], input, select, textarea, label, article, section, table, tr, td, th, li, img[alt], h1, h2, h3, p', target);
      if (result.error) speak(localizeControlError(result.error, language));
      else {
        const value = property === 'opacity' ? String(percent || number > 1 ? number / 100 : number) : `${number}${percent ? '%' : 'px'}`;
        result.element.style[property] = value;
        speak(localized(`Changed ${property} of ${target} to ${spokenValue}${spokenUnit}.`, `${target} का ${property} ${spokenValue}${spokenUnit} कर दिया।`, `${target} యొక్క ${property}ను ${spokenValue}${spokenUnit}గా మార్చాను.`));
      }
      return true;
    }

    const sizeCommand = text.match(/^make (.+?) (bigger|larger|smaller|normal size)$/);
    if (sizeCommand) {
      const [, target, size] = sizeCommand;
      const result = findControl('button, a[href], [role], input, select, textarea, label, article, section, table, tr, td, th, li, img[alt], h1, h2, h3, p', target);
      if (result.error) speak(localizeControlError(result.error, language));
      else {
        result.element.style.scale = size === 'smaller' ? '0.92' : size === 'normal size' ? '' : '1.08';
        speak(localized(`Made ${target} ${size === 'normal size' ? 'its normal size' : size}.`, `${target} का आकार ${size === 'smaller' ? 'छोटा' : size === 'normal size' ? 'सामान्य' : 'बड़ा'} कर दिया।`, `${target} పరిమాణాన్ని ${size === 'smaller' ? 'చిన్నదిగా' : size === 'normal size' ? 'సాధారణంగా' : 'పెద్దదిగా'} మార్చాను.`));
      }
      return true;
    }

    const fontCommand = rawText.match(/^(?:set|change) font size of (.+?) to (small|medium|large|\d{1,2}(?: pixels?| px)?)$/i);
    if (fontCommand) {
      const [, target, spokenSize] = fontCommand;
      const result = findControl('button, a[href], [role], input, select, textarea, label, article, section, table, tr, td, th, li, h1, h2, h3, p', target);
      if (result.error) speak(localizeControlError(result.error, language));
      else {
        const numericSize = Number.parseInt(spokenSize, 10);
        const size = Number.isNaN(numericSize) ? { small: '0.875em', medium: '1em', large: '1.25em' }[spokenSize.toLowerCase()] : `${Math.min(72, Math.max(8, numericSize))}px`;
        result.element.style.fontSize = size;
        speak(localized(`Changed the font size of ${target} to ${spokenSize}.`, `${target} के अक्षरों का आकार ${spokenSize} कर दिया।`, `${target} अक्षరాల పరిమాణాన్ని ${spokenSize}గా మార్చాను.`));
      }
      return true;
    }

    const resetStyleCommand = text.match(/^reset (?:the )?(?:style|appearance) of (.+)$/);
    if (resetStyleCommand) {
      const target = resetStyleCommand[1];
      const result = findControl('button, a[href], [role], input, select, textarea, label, article, section, table, tr, td, th, li, img[alt], h1, h2, h3, p', target);
      if (result.error) speak(localizeControlError(result.error, language));
      else {
        ['background-color', 'color', 'scale', 'font-size', 'width', 'height', 'padding', 'margin', 'border-radius', 'opacity'].forEach((property) => result.element.style.removeProperty(property));
        speak(localized(`Reset the appearance of ${target}.`, `${target} का रूप पहले जैसा कर दिया।`, `${target} రూపాన్ని మొదటిలా మార్చాను.`));
      }
      return true;
    }

    const selectCommand = rawText.match(/^(?:spy\s+)?(?:select|choose|pick)\s+(.+?)\s+(?:in|for)\s+(.+)$/i);
    if (selectCommand) {
      const [, optionLabel, fieldLabel] = selectCommand;
      const result = findControl('select', fieldLabel);
      if (result.error) speak(localizeControlError(result.error, language));
      else {
        const option = [...result.element.options].find((item) => normalizeName(item.label || item.textContent) === normalizeName(optionLabel));
        if (!option) speak(localized(`I couldn’t find the ${optionLabel} option in ${fieldLabel}.`, `${fieldLabel} में ${optionLabel} विकल्प नहीं मिला।`, `${fieldLabel}లో ${optionLabel} ఎంపిక కనబడలేదు.`));
        else {
          Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(result.element, option.value);
          result.element.dispatchEvent(new Event('input', { bubbles: true }));
          result.element.dispatchEvent(new Event('change', { bubbles: true }));
          speak(localized(`Selected ${option.label || option.textContent}.`, `${option.label || option.textContent} चुना गया।`, `${option.label || option.textContent} ఎంచుకున్నాను.`));
        }
      }
      return true;
    }

    const fillCommand = rawText.match(/^(?:spy\s+)?(?:fill|enter|type)\s+(.+?)\s+(?:with|as)\s+(.+)$/i)
      || rawText.match(/^(?:spy\s+)?(?:set|change|update)\s+(.+?)\s+(?:to|as)\s+(.+)$/i)
      || rawText.match(/^(?:spy\s+)?(?:enter|type)\s+(.+?)\s+into\s+(.+)$/i)
      || rawText.match(/^(.+?)\s+में\s+(.+?)\s+(?:भरें|भरो|दर्ज करें|लिखें)$/u)
      || rawText.match(/^(.+?)\s+లో\s+(.+?)\s+(?:నింపు|నింపండి|వ్రాయండి|రాయండి)$/u);
    if (fillCommand) {
      const [, first, second] = fillCommand;
      const valueFirst = /^enter|type/i.test(rawText) && /\s+into\s+/i.test(rawText);
      const fieldLabel = valueFirst ? second : first;
      const value = valueFirst ? first : second;
      const result = findControl('input:not([type="button"]):not([type="submit"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, [contenteditable="true"]', fieldLabel);
      if (result.error) speak(localizeControlError(result.error, language));
      else if (result.element.isContentEditable) {
        result.element.textContent = value;
        result.element.dispatchEvent(new Event('input', { bubbles: true }));
        speak(localized(`Added text to ${fieldLabel}.`, `${fieldLabel} में टेक्स्ट जोड़ दिया।`, `${fieldLabel}లో వచనాన్ని జోడించాను.`));
      } else {
        setElementValue(result.element, value);
        speak(localized(`Filled ${fieldLabel}.`, `${fieldLabel} भर दिया।`, `${fieldLabel} నింపాను.`));
      }
      return true;
    }

    const toggleCommand = text.match(/^(check|uncheck|enable|disable|turn on|turn off|switch on|switch off) (?:the )?(.+)$/);
    const hindiToggle = rawText.match(/^(चालू करें|चालू करो|बंद करें|बंद करो|सक्षम करें|अक्षम करें|चेक करें|अनचेक करें)\s+(.+)$/u);
    const teluguToggle = rawText.match(/^(.+?)\s+(ఆన్ చేయి|ఆన్ చేయండి|ఆఫ్ చేయి|ఆఫ్ చేయండి|ప్రారంభించు|ఆపివేయి)$/u);
    if (toggleCommand || hindiToggle || teluguToggle) {
      const action = toggleCommand?.[1] || hindiToggle?.[1] || teluguToggle?.[2];
      const fieldLabel = toggleCommand?.[2] || hindiToggle?.[2] || teluguToggle?.[1];
      const shouldCheck = ['check', 'enable', 'turn on', 'switch on', 'चालू करें', 'चालू करो', 'सक्षम करें', 'चेक करें'].includes(action) || /ఆన్ చేయి|ఆన్ చేయండి|ప్రారంభించు/u.test(action);
      const result = findControl('input[type="checkbox"], input[type="radio"]', fieldLabel);
      if (result.error) speak(localizeControlError(result.error, language));
      else if (result.element.type === 'radio' && !shouldCheck) speak(localized('Choose a different radio option to change that selection.', 'चयन बदलने के लिए कोई दूसरा विकल्प चुनें।', 'ఎంపికను మార్చడానికి మరో రేడియో ఎంపికను ఎంచుకోండి.'));
      else if (Boolean(result.element.checked) === shouldCheck) speak(localized(`${fieldLabel} is already ${shouldCheck ? 'checked' : 'unchecked'}.`, `${fieldLabel} पहले से ${shouldCheck ? 'चालू' : 'बंद'} है।`, `${fieldLabel} ఇప్పటికే ${shouldCheck ? 'ఆన్‌లో' : 'ఆఫ్‌లో'} ఉంది.`));
      else if (consequentialControl(result.element, fieldLabel) || ['enable', 'disable', 'turn on', 'turn off', 'switch on', 'switch off', 'चालू करें', 'चालू करो', 'बंद करें', 'बंद करो', 'सक्षम करें', 'अक्षम करें'].includes(action) || teluguToggle) {
        pendingActionRef.current = result.element;
        setPendingAction(shouldCheck ? `check ${fieldLabel}` : `uncheck ${fieldLabel}`);
        speak(localized(`Say confirm action to ${shouldCheck ? 'enable' : 'disable'} ${fieldLabel}, or say cancel.`, `${shouldCheck ? 'चालू' : 'बंद'} करने के लिए पुष्टि कहें, या रद्द कहें।`, `${shouldCheck ? 'ఆన్' : 'ఆఫ్'} చేయడానికి నిర్ధారించండి లేదా రద్దు చేయండి అని చెప్పండి.`));
      } else {
        result.element.click();
        speak(localized(`${fieldLabel} ${shouldCheck ? 'checked' : 'unchecked'}.`, `${fieldLabel} ${shouldCheck ? 'चेक' : 'अनचेक'} किया।`, `${fieldLabel} ${shouldCheck ? 'ఎంచుకున్నాను' : 'ఎంపికను తీసివేశాను'}.`));
      }
      return true;
    }

    const clearCommand = text.match(/^clear (?:the )?(.+)$/);
    const focusCommand = text.match(/^(?:focus|edit) (?:the )?(.+)$/);
    if (clearCommand || focusCommand) {
      const fieldLabel = (clearCommand || focusCommand)[1];
      const result = findControl('input:not([type="button"]):not([type="submit"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select', fieldLabel);
      if (result.error) speak(localizeControlError(result.error, language));
      else if (clearCommand && result.element instanceof HTMLSelectElement) speak(localized('Say select an option in that menu instead.', 'उस मेनू में कोई विकल्प चुनने के लिए कहें।', 'ఆ మెనూలో ఒక ఎంపికను ఎంచుకోమని చెప్పండి.'));
      else if (clearCommand) { setElementValue(result.element, ''); speak(localized(`Cleared ${fieldLabel}.`, `${fieldLabel} साफ़ कर दिया।`, `${fieldLabel} తొలగించాను.`)); }
      else { result.element.focus(); speak(localized(`Focused ${fieldLabel}.`, `${fieldLabel} पर फ़ोकस किया।`, `${fieldLabel}పై ఫోకస్ పెట్టాను.`)); }
      return true;
    }

    const clickCommand = rawText.match(/^(?:click|press|tap|activate|submit|save|send|delete|remove|redeem|sync) (?:the )?(.+)$/i)
      || rawText.match(/^(.+?)\s+(?:पर क्लिक करें|पर क्लिक करो|बटन दबाएं|बटन दबाओ|పై క్లిక్ చేయండి|నొక్కండి|బటన్ నొక్కు)$/iu);
    const submitFormCommand = text.match(/^submit (?:the )?(?:(.+?) )?form$/);
    if (submitFormCommand) {
      const formName = submitFormCommand[1];
      const forms = [...document.querySelectorAll('form')].filter((form) => isVisible(form) && (!formName || normalizeName(form.innerText).includes(formName)));
      if (!forms.length) speak(localized('I couldn’t find that form on this page.', 'इस पेज पर वह फ़ॉर्म नहीं मिला।', 'ఈ పేజీలో ఆ ఫారమ్ కనబడలేదు.'));
      else if (forms.length > 1) speak(localized('I found multiple forms. Say submit followed by the form name.', 'कई फ़ॉर्म मिले। फ़ॉर्म का नाम बताकर जमा करने को कहें।', 'ఒకటి కంటే ఎక్కువ ఫారమ్‌లు ఉన్నాయి. ఫారమ్ పేరు చెప్పి సమర్పించమని చెప్పండి.'));
      else {
        const submitButton = forms[0].querySelector('button[type="submit"], input[type="submit"]');
        if (!submitButton || submitButton.disabled) speak(localized('That form has no available submit button.', 'उस फ़ॉर्म में जमा करने का बटन उपलब्ध नहीं है।', 'ఆ ఫారమ్‌లో సమర్పించడానికి బటన్ అందుబాటులో లేదు.'));
        else {
          pendingActionRef.current = submitButton;
          setPendingAction(`submit ${formName || 'form'}`);
          speak(localized(`Say confirm action to submit ${formName || 'the form'}, or say cancel.`, `${formName || 'फॉर्म'} जमा करने के लिए पुष्टि कहें, या रद्द करें।`, `${formName || 'ఫారమ్'} సమర్పించడానికి నిర్ధారించండి లేదా రద్దు చేయండి అని చెప్పండి.`));
        }
      }
      return true;
    }
    if (clickCommand) {
      const label = clickCommand[1];
      const result = findControl('button, a[href], [role="button"], [role="tab"], summary, label', label);
      if (result.error) speak(localizeControlError(result.error, language));
      else if (/^(submit|save|send|delete|remove|redeem|sync)\b/.test(text) || consequentialControl(result.element, label)) {
        pendingActionRef.current = result.element;
        setPendingAction(label);
        speak(localized(`You chose ${label}. Say confirm action to continue, or say cancel.`, `आपने ${label} चुना है। आगे बढ़ने के लिए पुष्टि कहें, या रद्द करें।`, `మీరు ${label} ఎంచుకున్నారు. కొనసాగించడానికి నిర్ధారించండి లేదా రద్దు చేయండి అని చెప్పండి.`));
      } else {
        result.element.click();
        speak(localized(`Activated ${label}.`, `${label} सक्रिय किया।`, `${label}ను ప్రారంభించాను.`));
      }
      return true;
    }
    return false;
  };

  const respond = async (raw) => {
    const rawText = raw.trim();
    const text = rawText.toLocaleLowerCase('en-IN').replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();
    setError('');
    if (pendingActionRef.current) {
      if (/\b(cancel|no|stop|never mind)\b|नहीं|रद्द|मत करो|వద్దు|రద్దు/i.test(text)) {
        pendingActionRef.current = null;
        setPendingAction('');
        speak(localized('Action cancelled.', 'कार्रवाई रद्द कर दी गई।', 'చర్య రద్దు చేయబడింది.'));
        return;
      }
      if (/^(confirm|yes|proceed|confirm action)$|पुष्टि|हाँ|हां|ठीक है|అవును|నిర్ధారించు/i.test(text)) {
        const element = pendingActionRef.current;
        const label = pendingAction;
        pendingActionRef.current = null;
        setPendingAction('');
        if (element?.isConnected) { element.click(); speak(localized(`${label} confirmed.`, `${label} की पुष्टि हो गई।`, `${label} నిర్ధారించబడింది.`)); }
        else speak(localized('That control is no longer on this page. Please find it again and repeat the command.', 'यह नियंत्रण अब इस पेज पर नहीं है। फिर से ढूँढकर आदेश दें।', 'ఆ నియంత్రణ ఇప్పుడు ఈ పేజీలో లేదు. మళ్లీ గుర్తించి ఆదేశించండి.'));
        return;
      }
      speak(localized(`I’m waiting for confirmation to ${pendingAction}. Say confirm action or cancel.`, `${pendingAction} के लिए पुष्टि बाकी है। पुष्टि कहें या रद्द करें।`, `${pendingAction} కోసం నిర్ధారణ కావాలి. నిర్ధారించండి లేదా రద్దు చేయండి అని చెప్పండి.`));
      return;
    }
    if (pendingBill && /\b(cancel|no|stop|nevermind)\b|नहीं|रद्द|मत करो|వద్దు|రద్దు/.test(text)) {
      setPendingBill(null);
      speak(localized('Payment cancelled.', 'भुगतान रद्द कर दिया गया।', 'చెల్లింపు రద్దు చేయబడింది.'));
      return;
    }
    if (pendingBill && /\b(confirm|yes|proceed|pay now)\b|पुष्टि|हाँ|हां|ठीक है|అవును|నిర్ధారించు/.test(text)) {
      await payBill(pendingBill);
      return;
    }
    if (pendingBill) {
      speak(localized(
        `I’m waiting for confirmation to pay ${money(pendingBill.amount)} for ${String(pendingBill.utilityType).toLowerCase()}. Say confirm payment or cancel payment.`,
        `${String(pendingBill.utilityType).toLowerCase()} के ${money(pendingBill.amount)} भुगतान की पुष्टि बाकी है। पुष्टि कहें या भुगतान रद्द करें।`,
        `${String(pendingBill.utilityType).toLowerCase()} బిల్లు ${money(pendingBill.amount)} చెల్లింపుకు మీ నిర్ధారణ కోసం వేచి ఉన్నాను. నిర్ధారించండి లేదా రద్దు చేయండి అని చెప్పండి.`,
      ));
      return;
    }

    const billDetailCommand = text.match(/^(?:open|show|go to|navigate to|switch to|take me to) (?:the |my )?(.+?) bill$/i);
    if (billDetailCommand && !['a', 'any', 'all', 'utility'].includes(billDetailCommand[1])) {
      if (role === 'PLATFORM_ADMIN') {
        speak(localized('Opening bill management.', 'बिल प्रबंधन खोल रहा हूँ।', 'బిల్లుల నిర్వహణను తెరుస్తున్నాను.'));
        navigate('/admin/bills');
        return;
      }
      setBusy(true);
      try {
        const billResponse = await billService.getBills();
        const bills = billResponse.data.data.bills || [];
        const query = billDetailCommand[1].replace(/^(my|the) /, '');
        const matches = bills.filter((bill) => normalizeName(`${bill.utilityType} ${bill.provider} ${bill.id}`).includes(query));
        if (matches.length === 1) {
          speak(localized(`Opening ${String(matches[0].utilityType).toLowerCase()} bill details.`, `${matches[0].utilityType} बिल का विवरण खोल रहा हूँ।`, `${matches[0].utilityType} బిల్లు వివరాలను తెరుస్తున్నాను.`));
          navigate(`/bills/${matches[0].id}`);
        } else if (matches.length > 1) {
          speak(localized(`I found ${matches.length} matching bills. Please say the utility or provider name.`, `${matches.length} बिल मिले। कृपया उपयोगिता या प्रदाता का नाम बताएं।`, `${matches.length} బిల్లులు ఉన్నాయి. యుటిలిటీ లేదా ప్రొవైడర్ పేరును చెప్పండి.`));
        } else {
          speak(localized(`I couldn’t find a bill matching ${query}.`, `${query} से मेल खाता बिल नहीं मिला।`, `${query}కు సరిపడే బిల్లు కనబడలేదు.`));
        }
      } catch {
        speak(localized('I couldn’t load your bills. Please try again.', 'बिल लोड नहीं हो पाए। फिर कोशिश करें।', 'బిల్లులు లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.'));
      } finally {
        setBusy(false);
      }
      return;
    }

    const pageOpenIntent = /\b(open|show|go to|navigate to|switch to|take me to|open page)\b|खोलो|खोलिए|दिखाओ|दिखाइए|जाओ|जाएं|जाइए|चलिए|खोलें|दिखाइए|చూపించు|చూపండి|తెరువు|తెరవండి|వెళ్ళు|వెళ్ళండి|వెళ్లండి|మార్చు/i.test(text);
    const page = [...pages].sort((a, b) => Math.max(...b.names.map((name) => name.length)) - Math.max(...a.names.map((name) => name.length))).find(({ names }) => names.some((name) => text === name || (pageOpenIntent && text.includes(name))));
    if (page && !/\b(pay|owe|due|amount|much|next|when|status|history|total)\b/.test(text)) {
      const adminPath = { '/dashboard': '/admin', '/bills': '/admin/bills', '/payments': '/admin/payments', '/disputes': '/admin/disputes', '/reports': '/admin/reports', '/usage': '/admin/reports' }[page.path];
      const targetPath = role === 'PLATFORM_ADMIN' && adminPath ? adminPath : page.path;
      if (roles[targetPath] && !roles[targetPath].includes(role)) {
        speak(localized('That page is not available for your account.', 'यह पेज आपके खाते के लिए उपलब्ध नहीं है।', 'ఈ పేజీ మీ ఖాతాకు అందుబాటులో లేదు.'));
        return;
      }
      const [englishPage, hindiPage, teluguPage] = routeLabels[targetPath] || routeLabels[page.path] || [page.names[0], page.label?.hi || page.names[0], page.label?.te || page.names[0]];
      speak(localized(`Opening ${englishPage}.`, `${hindiPage} पेज खोल रहा हूँ।`, `${teluguPage} పేజీని తెరుస్తున్నాను.`));
      navigate(targetPath);
      return;
    }

    if (runControlCommand(text, rawText)) return;

    const appAnswer = appQuestions.find(({ match }) => match.test(text));
    if (appAnswer) {
      speak(localized(appAnswer.en, appAnswer.hi, appAnswer.te));
      return;
    }

    const isPay = /\b(pay|make a payment|settle)\b|भुगतान|चुकाओ|चुकाना|भर दो|చెల్లించు|చెల్లించాలి|కట్టాలి/.test(text);
    const wantsPayments = /\b(payment history|transactions|payments)\b|भुगतान इतिहास|చెల్లింపుల చరిత్ర/.test(text) && !isPay;
    const wantsDue = /\b(owe|due|unpaid|outstanding|how much|bill amount|bill total)\b|कितना|कितने|बकाया|देना है|ఎంత|బాకీ|చెల్లించాలి/.test(text);
    const wantsPaid = /\b(paid|how much have i paid|payment total)\b|कितना भुगतान|कितना भरा|చెల్లించిన మొత్తం/.test(text);
    const wantsNext = /\b(next|upcoming|when)\b|अगला|अगली|తదుపరి|ఎప్పుడు/.test(text) && /\b(bill|due)\b|बिल|బిల్లు/.test(text);
    const wantsBills = /\b(bill|bills)\b|बिल|బिलों|బిల్లు|బిల్లులు/.test(text);
    if (isPay && role === 'PLATFORM_ADMIN') {
      speak(localized('Bill payments are available from household accounts.', 'बिल का भुगतान घरेलू खातों से किया जा सकता है।', 'బిల్లుల చెల్లింపులు గృహ ఖాతాల ద్వారా చేయవచ్చు.'));
      return;
    }
    if (isPay || wantsDue || wantsPaid || wantsNext || wantsBills || wantsPayments) {
      setBusy(true);
      try {
        const [billResponse, paymentResponse] = await Promise.all([
          billService.getBills(),
          wantsPayments ? paymentService.getPayments() : Promise.resolve(null),
        ]);
        const bills = billResponse.data.data.bills || [];
        const openBills = bills.filter(unpaid);
        if (isPay) {
          const utilityNames = {
            electricity: ['electricity', 'बिजली', 'విద్యుత్', 'కరెంటు'], water: ['water', 'पानी', 'నీరు'], gas: ['gas', 'गैस', 'గ్యాస్'],
            internet: ['internet', 'इंटरनेट', 'ఇంటర్నెట్'], mobile: ['mobile', 'मोबाइल', 'మొబైల్', 'ఫోన్'],
          };
          const type = Object.keys(utilityNames).find((key) => utilityNames[key].some((name) => text.includes(name)));
          const candidates = openBills.filter((bill) => !type || String(bill.utilityType).toLowerCase().includes(type)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          if (!candidates.length) {
            speak(localized(`I couldn’t find an unpaid ${type || ''} bill to pay.`, `${type || 'इस उपयोगिता'} का कोई बकाया बिल नहीं मिला।`, `${type || 'ఈ యుటిలిటీ'} బకాయి బిల్లు కనబడలేదు.`));
          } else if (candidates.length > 1 && !type) {
            speak(localized(`You have ${candidates.length} unpaid bills. Say pay followed by the utility name, such as pay electricity bill.`, `आपके ${candidates.length} बिल बाकी हैं। भुगतान के लिए उपयोगिता का नाम बताएं, जैसे बिजली बिल का भुगतान करें।`, `మీకు ${candidates.length} బిల్లులు బాకీ ఉన్నాయి. కరెంటు బిల్లు చెల్లించు అని యుటిలిటీ పేరుతో చెప్పండి.`));
          } else {
            setPendingBill(candidates[0]);
            speak(localized(
              `Your ${String(candidates[0].utilityType).toLowerCase()} bill from ${candidates[0].provider} is ${money(candidates[0].amount)}${candidates.length > 1 ? ', the next one due' : ''}. Say confirm payment to proceed, or cancel payment.`,
              `${candidates[0].utilityType} का बिल ${candidates[0].provider} से ${money(candidates[0].amount)} है। भुगतान के लिए पुष्टि कहें या रद्द करें।`,
              `${candidates[0].provider} వారి ${candidates[0].utilityType} బిల్లు ${money(candidates[0].amount)}. చెల్లించడానికి నిర్ధారించండి లేదా రద్దు చేయండి అని చెప్పండి.`,
            ));
          }
        } else if (wantsPayments) {
          const payments = paymentResponse.data.data.payments || [];
          const latest = payments[0];
          speak(latest
            ? localized(`You have ${payments.length} recorded payments. Your latest is ${money(latest.amount)} and its status is ${String(latest.status).toLowerCase()}. Opening payment history.`, `आपके ${payments.length} भुगतान दर्ज हैं। सबसे नया भुगतान ${money(latest.amount)} का है और इसकी स्थिति ${String(latest.status).toLowerCase()} है। भुगतान इतिहास खोल रहा हूँ।`, `మీ చెల్లింపులు ${payments.length} నమోదయ్యాయి. తాజా చెల్లింపు ${money(latest.amount)}, స్థితి ${String(latest.status).toLowerCase()}. చెల్లింపుల చరిత్ర తెరుస్తున్నాను.`)
            : localized('There are no recorded payments yet. Opening payment history.', 'अभी तक कोई भुगतान दर्ज नहीं है। भुगतान इतिहास खोल रहा हूँ।', 'ఇంకా చెల్లింపులు నమోదు కాలేదు. చెల్లింపుల చరిత్ర తెరుస్తున్నాను.'));
          navigate('/payments');
        } else if (wantsPaid) {
          const paidTotal = bills.filter((bill) => ['PAID', 'SUCCESS'].includes(String(bill.status || '').toUpperCase())).reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
          speak(localized(`You have paid ${money(paidTotal)} this cycle.`, `इस बिलिंग चक्र में आपने ${money(paidTotal)} का भुगतान किया है।`, `ఈ బిల్లింగ్ చక్రంలో మీరు ${money(paidTotal)} చెల్లించారు.`));
        } else if (wantsNext) {
          const next = [...openBills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
          const dueDate = next && new Date(`${next.dueDate}T00:00:00`).toLocaleDateString(language, { day: 'numeric', month: 'long' });
          speak(next
            ? localized(`Your next bill is ${String(next.utilityType).toLowerCase()}, ${money(next.amount)}, due ${dueDate}.`, `आपका अगला ${next.utilityType} बिल ${money(next.amount)} का है और इसकी अंतिम तारीख ${dueDate} है।`, `తదుపరి ${next.utilityType} బిల్లు ${money(next.amount)}. చెల్లింపు చివరి తేదీ ${dueDate}.`)
            : localized('You have no upcoming unpaid bills.', 'अभी कोई अगला बकाया बिल नहीं है।', 'మీకు చెల్లించాల్సిన తదుపరి బిల్లు లేదు.'));
        } else if (wantsDue || wantsBills) {
          const total = openBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
          speak(localized(`You have ${openBills.length} unpaid bills totaling ${money(total)}. Opening bills.`, `आपके ${openBills.length} बिल बकाया हैं। कुल ${money(total)} बाकी है। बिल पेज खोल रहा हूँ।`, `మీకు ${openBills.length} బిల్లులు బాకీ ఉన్నాయి. మొత్తం ${money(total)} చెల్లించాలి. బిల్లుల పేజీని తెరుస్తున్నాను.`));
          navigate('/bills');
        }
      } catch {
        speak(localized('I couldn’t load that information. Please try again.', 'जानकारी लोड नहीं हुई। कृपया फिर कोशिश करें।', 'ఆ సమాచారం లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.'));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (/\b(help|what can you do|commands)\b|मदद|सहायता|आप क्या कर सकते|సహాయం|ఏం చేయగలవు/i.test(text)) {
      speak(localized('Say open bills, click a labeled button, fill a field, select an option, check a box, read the page, or ask what you owe. I ask for confirmation before important actions.', 'बिल खोलें, कोई पेज खोलें, बिल की जानकारी पूछें या भुगतान कहें। महत्वपूर्ण कार्रवाई से पहले मैं पुष्टि माँगूँगा।', 'బిల్లులు తెరవండి, పేజీని చూపించమని లేదా బిల్లు వివరాలు చెప్పమని అడగండి. ముఖ్యమైన చర్యకు ముందు మీ నిర్ధారణ కోరుతాను.'));
      return;
    }
    if (/\b(hello|hi|hey|spy)\b|नमस्ते|नमस्कार|हेलो|హలో|నమస్కారం|హాయ్/i.test(text)) {
      speak(localized('Hello! I can open pages, operate visible controls, fill forms, check bills, and guide payments. What should I do?', 'नमस्ते! मैं पेज खोल सकता हूँ, दिख रहे नियंत्रण चला सकता हूँ, फॉर्म भर सकता हूँ और बिल भुगतान में मदद कर सकता हूँ। बताइए क्या करूँ?', 'నమస్కారం! పేజీలు తెరవగలను, కనిపించే నియంత్రణలను ఉపయోగించగలను, ఫారమ్‌లు నింపగలను, బిల్లులు చూసి చెల్లింపులో సహాయం చేయగలను. ఏం చేయాలి?'));
      return;
    }
    speak(localized('I didn’t catch that. Try “open bills”, “how much do I owe?”, “show payment history”, or “pay electricity bill”.', 'समझ नहीं आया। “बिल खोलो”, “कितना बकाया है?” या “बिजली बिल का भुगतान करें” कहें।', 'అర్థం కాలేదు. “బిల్లులు తెరవండి”, “ఎంత బాకీ ఉంది?” లేదా “కరెంటు బిల్లు చెల్లించు” అని చెప్పండి.'));
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(localized('Voice recognition is not supported in this browser. Try Chrome or Edge.', 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। Chrome या Edge आज़माएँ।', 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు. Chrome లేదా Edge ప్రయత్నించండి.'));
      return;
    }
    if (listening || busy) return;
    setError('');
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => { void respond(event.results[0][0].transcript); };
    recognition.onerror = (event) => setError(event.error === 'not-allowed'
      ? localized('Allow microphone access in your browser, then try again.', 'ब्राउज़र में माइक्रोफ़ोन की अनुमति दें, फिर कोशिश करें।', 'బ్రౌజర్‌లో మైక్రోఫోన్ అనుమతించి మళ్లీ ప్రయత్నించండి.')
      : event.error === 'no-speech'
        ? localized('I didn’t hear anything. Try again.', 'कुछ सुनाई नहीं दिया। फिर कोशिश करें।', 'ఏమీ వినిపించలేదు. మళ్లీ ప్రయత్నించండి.')
        : localized('I couldn’t understand that recording. Please try again.', 'आवाज़ समझ नहीं आई। कृपया फिर कोशिश करें।', 'ఆ మాటలు అర్థం కాలేదు. మళ్లీ ప్రయత్నించండి.'));
    recognition.onend = () => setListening(false);
    setListening(true);
    try { recognition.start(); } catch {
      setListening(false);
      setError(localized('I couldn’t start the microphone. Please try again.', 'माइक्रोफ़ोन शुरू नहीं हो पाया। कृपया फिर कोशिश करें।', 'మైక్రోఫోన్ ప్రారంభించలేకపోయాను. మళ్లీ ప్రయత్నించండి.'));
    }
  };
  useEffect(() => {
    startListeningRef.current = startListening;
  });

  return (
    <div className={`spy-assistant ${open ? 'is-open' : ''} ${listening ? 'is-listening' : ''} ${busy ? 'is-busy' : ''}`}>
      {open && <section className="spy-panel" aria-label="Spy">
        <div className="spy-panel-head"><span className="spy-robot-mark"><SpyLogo /></span><div><strong>Spy robot</strong><small>{listening ? localized('Listening for your command…', 'आपका आदेश सुन रहा हूँ…', 'మీ ఆదేశం వింటున్నాను…') : busy ? localized('Working on that…', 'उस पर काम कर रहा हूँ…', 'దానిపై పని చేస్తున్నాను…') : localized('Ready · Ask me to navigate or act', 'तैयार · पेज खोलने या काम करने को कहें', 'సిద్ధం · పేజీ తెరవమని లేదా పని చేయమని అడగండి')}</small></div><button type="button" className="spy-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button></div>
        <p className="spy-message" aria-live="polite">{message}</p>
        {error && <p className="spy-error" role="alert">{error}</p>}
        {pendingBill && <div className="spy-confirm"><strong>{localized('Confirm payment', 'भुगतान की पुष्टि करें', 'చెల్లింపును నిర్ధారించండి')}</strong><span>{pendingBill.utilityType} · {money(pendingBill.amount)}</span><button type="button" className="spy-cancel" onClick={() => { setPendingBill(null); speak(localized('Payment cancelled.', 'भुगतान रद्द कर दिया गया।', 'చెల్లింపు రద్దు చేయబడింది.')); }}>{localized('Cancel payment', 'भुगतान रद्द करें', 'చెల్లింపును రద్దు చేయండి')}</button></div>}
        <label className="spy-language">{localized('Language', 'भाषा', 'భాష')}<select value={language} onChange={(event) => selectLanguage(event.target.value)} disabled={listening}><option value="en-IN">English</option><option value="hi-IN">हिन्दी</option><option value="te-IN">తెలుగు</option></select></label>
        <button type="button" className="spy-talk" onClick={startListening} disabled={listening || busy}><SpyLogo />{listening ? localized('Listening…', 'सुन रहा हूँ…', 'వింటున్నాను…') : busy ? localized('Working…', 'काम कर रहा हूँ…', 'పని చేస్తున్నాను…') : localized('Talk to Spy', 'Spy से बात करें', 'Spyతో మాట్లాడండి')}</button>
        {pendingAction && <div className="spy-confirm"><strong>{localized('Confirm action', 'कार्रवाई की पुष्टि करें', 'చర్యను నిర్ధారించండి')}</strong><span>{pendingAction}</span><button type="button" className="spy-cancel" onClick={() => { pendingActionRef.current = null; setPendingAction(''); speak(localized('Action cancelled.', 'कार्रवाई रद्द कर दी गई।', 'చర్య రద్దు చేయబడింది.')); }}>{localized('Cancel action', 'कार्रवाई रद्द करें', 'చర్యను రద్దు చేయండి')}</button></div>}
        <small className="spy-examples">{localized('Try “open bills”, “switch to settings”, “click Sync bills”, “fill email with…”, “select an option in a menu”, “enable autopay”, or “read page”. Important actions ask you to confirm.', 'कहें “बिल खोलो”, “सेटिंग्स खोलो”, “बिल सिंक पर क्लिक करो”, “ईमेल में … भरो”, “ऑटोपे चालू करो” या “पेज पढ़ो”। महत्वपूर्ण काम से पहले पुष्टि माँगी जाएगी।', '“బిల్లులు తెరువు”, “సెట్టింగ్స్ తెరువు”, “Sync bills నొక్కు”, “ఈమెయిల్ నింపు”, “ఆటో పే ఆన్ చేయి” లేదా “పేజీ చదువు” అని చెప్పండి. ముఖ్యమైన చర్యకు ముందు నిర్ధారణ అడుగుతాను.')}</small>
      </section>}
      <button type="button" className="spy-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close Spy' : 'Open Spy'}><SpyLogo />{open ? 'Close Spy' : 'Ask Spy'}</button>
    </div>
  );
};
