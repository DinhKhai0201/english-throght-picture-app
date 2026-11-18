// IELTS Listening Part 1 (Task 1) Complete Generator & Massive Dataset
// Direct TTS (no unnecessary intro phrases) + Smart Grading

const DIGIT_WORDS = ["oh", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const MONTHS = [
  { num: 1, full: "January", short: "Jan", days: 31 },
  { num: 2, full: "February", short: "Feb", days: 28 },
  { num: 3, full: "March", short: "Mar", days: 31 },
  { num: 4, full: "April", short: "Apr", days: 30 },
  { num: 5, full: "May", short: "May", days: 31 },
  { num: 6, full: "June", short: "Jun", days: 30 },
  { num: 7, full: "July", short: "Jul", days: 31 },
  { num: 8, full: "August", short: "Aug", days: 31 },
  { num: 9, full: "September", short: "Sep", days: 30 },
  { num: 10, full: "October", short: "Oct", days: 31 },
  { num: 11, full: "November", short: "Nov", days: 30 },
  { num: 12, full: "December", short: "Dec", days: 31 },
];

const ORDINAL_WORDS = [
  "", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
  "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth",
  "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth", "twenty-ninth", "thirtieth", "thirty-first",
];

function getOrdinalSuffix(n) {
  if (n >= 11 && n <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Convert any word/name into direct IELTS spelling: "Campbell" -> "C, A, M, P, B, E, double L"
export function wordToSpellingTts(word) {
  const clean = word.replace(/[^a-zA-Z']/g, "");
  const parts = [];
  let i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if (ch === "'") {
      parts.push("apostrophe");
      i += 1;
      continue;
    }
    const upper = ch.toUpperCase();
    if (i + 1 < clean.length && clean[i + 1].toUpperCase() === upper) {
      parts.push(`double ${upper}`);
      i += 2;
    } else {
      parts.push(upper);
      i += 1;
    }
  }
  return parts.join(", ");
}

export function numberToEnglishSpeech(n) {
  if (n === 0) return "zero";
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  const underThousand = (num) => {
    const parts = [];
    const h = Math.floor(num / 100);
    const rem = num % 100;
    if (h > 0) parts.push(`${ones[h]} hundred`);
    if (rem > 0) {
      if (h > 0) parts.push("and");
      if (rem < 20) {
        parts.push(ones[rem]);
      } else {
        const t = Math.floor(rem / 10);
        const o = rem % 10;
        parts.push(o > 0 ? `${tens[t]}-${ones[o]}` : tens[t]);
      }
    }
    return parts.join(" ");
  };

  const parts = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const rest = n % 1_000;

  if (millions > 0) parts.push(`${underThousand(millions)} million`);
  if (thousands > 0) parts.push(`${underThousand(thousands)} thousand`);
  if (rest > 0) {
    if ((millions > 0 || thousands > 0) && rest < 100) {
      parts.push(`and ${underThousand(rest)}`);
    } else {
      parts.push(underThousand(rest));
    }
  }
  return parts.join(", ");
}

function yearToSpeech(year) {
  if (year >= 2000 && year <= 2009) {
    return year === 2000 ? "two thousand" : `two thousand and ${numberToEnglishSpeech(year - 2000)}`;
  }
  const first = Math.floor(year / 100);
  const second = year % 100;
  if (second === 0) return `${numberToEnglishSpeech(first)} hundred`;
  if (second < 10) return `${numberToEnglishSpeech(first)} oh ${DIGIT_WORDS[second]}`;
  return `${numberToEnglishSpeech(first)} ${numberToEnglishSpeech(second)}`;
}

function digitsToPhoneSpeech(digitGroups) {
  const speakGroup = (group) => {
    const out = [];
    let i = 0;
    while (i < group.length) {
      const ch = group[i];
      if (i + 2 < group.length && group[i + 1] === ch && group[i + 2] === ch) {
        out.push(`triple ${DIGIT_WORDS[Number(ch)]}`);
        i += 3;
      } else if (i + 1 < group.length && group[i + 1] === ch) {
        out.push(`double ${DIGIT_WORDS[Number(ch)]}`);
        i += 2;
      } else {
        out.push(DIGIT_WORDS[Number(ch)]);
        i += 1;
      }
    }
    return out.join(" ");
  };
  return digitGroups.map(speakGroup).join(", ");
}

// ---------------------------------------------------------------------------
// 1. NUMBERS GENERATOR (Realistic IELTS numbers, read directly without intro)
// ---------------------------------------------------------------------------
export const NUMBER_RANGE_CONFIG = [
  { id: "0-20", label: "0 – 20 (Bảng bấm)" },
  { id: "teen-ty", label: "Bẫy -teen / -ty (13–90)" },
  { id: "100-9999", label: "Hàng trăm & Nghìn (100 – 9,999)" },
  { id: "10k-999k", label: "Chục nghìn – Trăm nghìn (10k – 999k)" },
  { id: "millions", label: "Hàng triệu (1M – 999M)" },
  { id: "mixed-scale", label: "Giá tiền (£/$) & Tổng hợp" },
];

export function generateNumberPrompt(rangeId) {
  if (rangeId === "teen-ty") {
    const pairs = [13, 30, 14, 40, 15, 50, 16, 60, 17, 70, 18, 80, 19, 90];
    const num = pickRandom(pairs);
    return {
      target: String(num),
      display: String(num),
      tts: numberToEnglishSpeech(num),
      slowTts: numberToEnglishSpeech(num),
      accepted: [String(num)],
      hint: num < 20 ? `Đuôi "-teen" nhấn mạnh và có âm /n/ cuối (${num}).` : `Đuôi "-ty" nhấn âm đầu (${num}).`,
      label: "Bẫy -teen / -ty",
    };
  }

  if (rangeId === "100-9999") {
    const roll = Math.random();
    let num;
    if (roll < 0.45) {
      num = randInt(1, 9) * 100 + pickRandom([0, 15, 20, 25, 30, 40, 45, 50, 60, 75, 80, 90, randInt(1, 99)]);
    } else {
      num = randInt(1, 9) * 1000 + pickRandom([0, 100, 200, 250, 300, 400, 500, 600, 750, 800, randInt(10, 99) * 10]);
    }
    const formatted = num.toLocaleString("en-US");
    return {
      target: formatted,
      display: formatted,
      tts: numberToEnglishSpeech(num),
      slowTts: numberToEnglishSpeech(num),
      accepted: [String(num), formatted],
      hint: "Gõ liền (1450) hoặc có dấu phẩy (1,450) đều đúng.",
      label: "Số 100 – 9,999",
    };
  }

  if (rangeId === "10k-999k") {
    const roll = Math.random();
    let num;
    if (roll < 0.6) {
      // Realistic round IELTS numbers: e.g. 15,000 / 45,500 / 120,000 / 350,000
      num = pickRandom([
        randInt(10, 99) * 1000,
        randInt(10, 99) * 1000 + 500,
        randInt(1, 9) * 100_000 + randInt(1, 9) * 10_000,
        randInt(10, 95) * 10_000,
      ]);
    } else {
      num = randInt(10, 999) * 1000 + pickRandom([0, 200, 500, 750, randInt(1, 9) * 100]);
    }
    const formatted = num.toLocaleString("en-US");
    return {
      target: formatted,
      display: formatted,
      tts: numberToEnglishSpeech(num),
      slowTts: numberToEnglishSpeech(num),
      accepted: [String(num), formatted],
      hint: "Nghe cụm hàng nghìn trước chữ 'thousand'.",
      label: "10,000 – 999,999",
    };
  }

  if (rangeId === "millions") {
    // Realistic IELTS million numbers (not 9 random digits!)
    const templates = [
      () => randInt(1, 95) * 1_000_000,
      () => randInt(1, 50) * 1_000_000 + 500_000,
      () => randInt(1, 25) * 1_000_000 + randInt(1, 9) * 100_000,
      () => randInt(1, 9) * 100_000_000 + pickRandom([0, 50_000_000, 25_000_000]),
      () => randInt(1, 19) * 1_000_000 + randInt(1, 9) * 10_000,
    ];
    const num = pickRandom(templates)();
    const formatted = num.toLocaleString("en-US");
    return {
      target: formatted,
      display: formatted,
      tts: numberToEnglishSpeech(num),
      slowTts: numberToEnglishSpeech(num),
      accepted: [String(num), formatted],
      hint: "Gõ liền (VD: 2500000) hoặc có dấu phẩy (2,500,000) đều được.",
      label: "Hàng triệu (1M – 999M)",
    };
  }

  const pounds = randInt(5, 450);
  const pence = pickRandom([0, 0, 20, 30, 50, 75, 80, 95]);
  const currency = pickRandom([
    { symbol: "£", word: "pounds" },
    { symbol: "$", word: "dollars" },
  ]);
  if (pence === 0) {
    return {
      target: `${currency.symbol}${pounds}`,
      display: `${currency.symbol}${pounds}`,
      tts: `${numberToEnglishSpeech(pounds)} ${currency.word}`,
      slowTts: `${numberToEnglishSpeech(pounds)} ${currency.word}`,
      accepted: [`${currency.symbol}${pounds}`, String(pounds)],
      hint: "Có thể gõ chỉ con số hoặc kèm ký hiệu tiền tệ.",
      label: "Giá tiền Part 1",
    };
  }
  const penceStr = String(pence).padStart(2, "0");
  return {
    target: `${currency.symbol}${pounds}.${penceStr}`,
    display: `${currency.symbol}${pounds}.${penceStr}`,
    tts: `${numberToEnglishSpeech(pounds)} ${currency.word} ${numberToEnglishSpeech(pence)}`,
    slowTts: `${numberToEnglishSpeech(pounds)} ${currency.word} ${numberToEnglishSpeech(pence)}`,
    accepted: [`${currency.symbol}${pounds}.${penceStr}`, `${pounds}.${penceStr}`],
    hint: "Gõ số tiền có dấu chấm thập phân (VD: 14.50).",
    label: "Giá tiền có lẻ",
  };
}

// ---------------------------------------------------------------------------
// 2. PHONE NUMBERS GENERATOR (Direct reading, no intro)
// ---------------------------------------------------------------------------
export function generatePhonePrompt() {
  const prefixes = ["07700", "07812", "07946", "020", "0161", "0131", "0412", "0433", "0800"];
  const p = pickRandom(prefixes);
  const g1 = pickRandom([
    `${randInt(1, 9)}${randInt(0, 9)}${randInt(0, 9)}`,
    `${randInt(1, 9)}${ [0, 2, 3, 5, 7, 8][randInt(0, 5)] }${ [0, 2, 3, 5, 7, 8][randInt(0, 5)] }`,
    "900", "496", "794", "388", "550", "882", "664", "300",
  ]);
  const g2 = pickRandom([
    `${randInt(100, 999)}`,
    `${randInt(1, 9)}00`,
    `0${randInt(10, 99)}`,
    `${randInt(1, 9)}55`,
    `${randInt(1, 9)}88`,
    `${randInt(10, 99)}0`,
  ]);
  const groups = [p, g1, g2];
  const spaced = groups.join(" ");
  const compact = groups.join("");
  const speech = digitsToPhoneSpeech(groups);

  return {
    target: spaced,
    display: spaced,
    tts: speech,
    slowTts: groups.map((g) => g.split("").map((d) => DIGIT_WORDS[Number(d)]).join(", ")).join(", "),
    accepted: [compact, spaced],
    hint: "0 đọc là 'oh', 2 số liền nhau đọc 'double', 3 số đọc 'triple'. Gõ liền hay cách đều đúng.",
    label: "Số điện thoại",
  };
}

// ---------------------------------------------------------------------------
// 3. DATES & TIMES GENERATOR (Direct reading)
// ---------------------------------------------------------------------------
export function generateDatePrompt() {
  if (Math.random() < 0.75) {
    const m = pickRandom(MONTHS);
    const day = randInt(1, m.days);
    const includeYear = Math.random() < 0.4;
    const year = randInt(1988, 2026);
    const ordSuffix = getOrdinalSuffix(day);
    const ordWord = ORDINAL_WORDS[day];

    const ukStyle = Math.random() < 0.65;
    const display = includeYear ? `${day} ${m.full} ${year}` : `${day} ${m.full}`;

    const tts = ukStyle
      ? includeYear
        ? `the ${ordWord} of ${m.full}, ${yearToSpeech(year)}`
        : `the ${ordWord} of ${m.full}`
      : includeYear
      ? `${m.full} the ${ordWord}, ${yearToSpeech(year)}`
      : `${m.full} ${ordWord}`;

    const mmPad = String(m.num).padStart(2, "0");
    const ddPad = String(day).padStart(2, "0");
    const accepted = includeYear
      ? [
          `${day} ${m.full} ${year}`,
          `${ordSuffix} ${m.full} ${year}`,
          `${m.full} ${day} ${year}`,
          `${m.full} ${day}, ${year}`,
          `${m.full} ${ordSuffix} ${year}`,
          `${day} ${m.short} ${year}`,
          `${day}/${m.num}/${year}`,
          `${ddPad}/${mmPad}/${year}`,
        ]
      : [
          `${day} ${m.full}`,
          `${ordSuffix} ${m.full}`,
          `${m.full} ${day}`,
          `${m.full} ${ordSuffix}`,
          `${day} ${m.short}`,
          `${m.short} ${day}`,
          `${day}/${m.num}`,
          `${ddPad}/${mmPad}`,
        ];

    return {
      target: display,
      display,
      tts,
      slowTts: `${day} ${m.full}${includeYear ? ` ${year}` : ""}`,
      accepted,
      hint: "Gõ ngày + tháng (VD: 14 October, 14th October hoặc 14/10).",
      label: includeYear ? "Ngày tháng năm" : "Ngày & Tháng",
    };
  }

  const hour = randInt(1, 12);
  const minuteOpts = [
    { m: "00", tts: `${numberToEnglishSpeech(hour)} o'clock` },
    { m: "15", tts: `quarter past ${numberToEnglishSpeech(hour)}` },
    { m: "30", tts: `half past ${numberToEnglishSpeech(hour)}` },
    { m: "45", tts: `quarter to ${numberToEnglishSpeech(hour === 12 ? 1 : hour + 1)}` },
    { m: "10", tts: `ten past ${numberToEnglishSpeech(hour)}` },
    { m: "20", tts: `twenty past ${numberToEnglishSpeech(hour)}` },
    { m: "50", tts: `ten to ${numberToEnglishSpeech(hour === 12 ? 1 : hour + 1)}` },
  ];
  const chosen = pickRandom(minuteOpts);
  const display = `${hour}:${chosen.m}`;
  const padded = `${String(hour).padStart(2, "0")}:${chosen.m}`;
  return {
    target: display,
    display,
    tts: chosen.tts,
    slowTts: `${numberToEnglishSpeech(hour)} ${chosen.m === "00" ? "o'clock" : numberToEnglishSpeech(Number(chosen.m))}`,
    accepted: [display, padded, `${hour}.${chosen.m}`, padded.replace(":", ".")],
    hint: "Gõ dạng giờ:phút (VD: 9:30 hoặc 4:45).",
    label: "Giờ giấc (Time)",
  };
}

// ---------------------------------------------------------------------------
// 4. MASSIVE PROPER NAMES LIST (130+ Real IELTS Surnames & First Names)
//    Direct TTS: reads name + spells letters directly (no "The surname is...")
// ---------------------------------------------------------------------------
export const PROPER_NAMES_LIST = [
  "Smith", "Campbell", "Macfarlane", "Gallagher", "Featherstone", "Richardson", "Abercrombie", "Henderson",
  "Montgomery", "Kowalski", "Whitaker", "Greenwood", "McAllister", "Bainbridge", "Schwartz", "Sutherland",
  "Cunningham", "Callaghan", "Beaumont", "Strickland", "Pendleton", "Fitzgerald", "O'Connor", "Hawthorne",
  "Merriweather", "Holloway", "Bradshaw", "Nightingale", "Pemberton", "Vandenberg", "Carmichael", "Reynolds",
  "Chambers", "Matthews", "Stephens", "Davidson", "Morrison", "Johnston", "Hamilton", "Graham",
  "Wallace", "Crawford", "Douglas", "Ferguson", "Fleming", "Gordon", "MacDonald", "Mackenzie",
  "Paterson", "Robertson", "Stewart", "Thomson", "Atkinson", "Blackburn", "Bradford", "Cartwright",
  "Chapman", "Davenport", "Dickinson", "Fairbanks", "Gillespie", "Hargreaves", "Humphreys", "Hutchinson",
  "Kingsley", "Lawrence", "Lindsey", "Lockhart", "Manning", "Middleton", "Nicholson", "Parkinson",
  "Pritchard", "Radcliffe", "Rutherford", "Sanderson", "Shepherd", "Thornton", "Townsend", "Wilkinson",
  "Williamson", "Woodward", "Worthington", "Zimmerman", "Ackerman", "Ashworth", "Beresford", "Brannigan",
  "Butterworth", "Chadwick", "Cockburn", "Dalrymple", "Etheridge", "Fanshawe", "Grosvenor", "Heywood",
  "Illingworth", "Kavanagh", "Langley", "Llewellyn", "Molyneux", "Northcott", "O'Sullivan", "Pennington",
  "Quigley", "Ramsbottom", "Somerville", "Trowbridge", "Underwood", "Wainwright", "Wetherby", "Yarborough",
  "Alistair", "Beatrice", "Catherine", "Dominic", "Eleanor", "Frederick", "Genevieve", "Humphrey",
  "Isabelle", "jacqueline", "Katheryn", "Lawrence", "Madeleine", " Nathaniel", "Penelope", "Sebastian",
  "Theodore", "Victoria", "Winifred", "Zachary",
].map((n) => n.trim());

export function generateNamePrompt() {
  const name = pickRandom(PROPER_NAMES_LIST);
  const spell = wordToSpellingTts(name);
  const altClean = name.replace(/'/g, "");
  return {
    target: name,
    display: name,
    // Read name directly, then spell letters clearly without filler intro
    tts: `${name}. ${spell}`,
    slowTts: spell,
    accepted: [name, altClean],
    hint: `Đánh vần: ${spell}`,
    label: "Tên riêng (130+ Tên IELTS)",
  };
}

// ---------------------------------------------------------------------------
// 5. MASSIVE ADDRESSES & DYNAMIC UK POSTCODES (55+ Streets & Infinite Postcodes)
// ---------------------------------------------------------------------------
export const STREET_NAMES_LIST = [
  "Oakwood Avenue", "Highfield Crescent", "Meadowbrook Lane", "Station Road", "Bridgewater Street",
  "Waverley Drive", "Kingsley Gardens", "Sycamore Close", "Hawthorn Terrace", "Grosvenor Square",
  "Clarence Parade", "Stirling Boulevard", "Chestnut Grove", "Victoria Embankment", "Blenheim Palace Road",
  "Kensington Walk", "Lansdowne Crescent", "Marlborough Street", "Nightingale Way", "Wellington Place",
  "Windermere Avenue", "Abbeydale Road", "Beechwood Drive", "Canterbury Close", "Devonshire Terrace",
  "Elmhurst Lane", "Fairview Gardens", "Gloucester Road", "Heatherfield Way", "Ivybridge Street",
  "Junction Road", "Knightsbridge Avenue", "Lavender Hill", "Maplewood Close", "Northumberland Street",
  "Orchard Rise", "Pembroke Mews", "Queensberry Place", "Ravenscroft Avenue", "Silverdale Road",
  "Thornhill Crescent", "Upland Road", "Vicarage Lane", "Westminster Way", "Yewtree Close",
  "Aldersgate Street", "Bishopsgate Road", "Cornmarket Street", "Farringdon Lane", "Guildhall Square",
  "Hampstead Heath", "Islington Green", "Leadenhall Street", "Moorgate Avenue", "Piccadilly Circus",
];

const POSTCODE_AREAS = ["SW", "EC", "WC", "NW", "SE", "EH", "OX", "CB", "LS", "BS", "NG", "CF", "RG", "YO", "M", "B", "G", "L"];
const POSTCODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateAddressPrompt() {
  if (Math.random() < 0.65) {
    const houseNum = Math.random() < 0.2 ? `${randInt(1, 50)}${pickRandom(["A", "B", "C"])}` : String(randInt(5, 420));
    const street = pickRandom(STREET_NAMES_LIST);
    const firstWord = street.split(" ")[0];
    const spellFirst = wordToSpellingTts(firstWord);
    const full = `${houseNum} ${street}`;
    return {
      target: full,
      display: full,
      // Read the address directly without "that's..."
      tts: full,
      slowTts: `${houseNum}, ${street}. ${spellFirst}`,
      accepted: [full],
      hint: `Tên đường: ${street} (${spellFirst})`,
      label: "Địa chỉ (55+ Tên đường)",
    };
  }

  // Dynamic UK Postcode generator (infinite combinations)
  const area = pickRandom(POSTCODE_AREAS);
  const d1 = randInt(1, 19);
  const l1 = POSTCODE_LETTERS[randInt(0, POSTCODE_LETTERS.length - 1)];
  const l2 = POSTCODE_LETTERS[randInt(0, POSTCODE_LETTERS.length - 1)];
  const d2 = randInt(1, 9);
  const pc = `${area}${d1} ${d2}${l1}${l2}`;
  const compact = pc.replace(/\s+/g, "");

  const speakChars = (str) =>
    str
      .split("")
      .map((ch) => (/[0-9]/.test(ch) ? DIGIT_WORDS[Number(ch)] : ch))
      .join(", ");
  const [part1, part2] = pc.split(" ");
  const tts = `${speakChars(part1)}, ${speakChars(part2)}`;

  return {
    target: pc,
    display: pc,
    tts,
    slowTts: tts,
    accepted: [pc, compact],
    hint: "Mã bưu điện UK. Gõ có hoặc không có khoảng trắng đều đúng.",
    label: "Postcode UK (Sinh ngẫu nhiên)",
  };
}

// ---------------------------------------------------------------------------
// 6. MASSIVE PART 1 WORDS DATASET (200+ Core Form-Completion Words)
// ---------------------------------------------------------------------------
export const PART1_WORDS_LIST = [
  // Accommodation & Housing
  { target: "accommodation", vi: "Chỗ ở" },
  { target: "apartment", vi: "Căn hộ" },
  { target: "balcony", vi: "Ban công" },
  { target: "basement", vi: "Tầng hầm" },
  { target: "blanket", vi: "Chăn mền" },
  { target: "cabinet", vi: "Tủ đựng đồ" },
  { target: "corridor", vi: "Hành lang" },
  { target: "cottages", vi: "Nhà tranh / Biệt thự nghỉ dưỡng" },
  { target: "cupboard", vi: "Tủ chén (chữ P câm)" },
  { target: "curtains", vi: "Rèm cửa" },
  { target: "deposit", vi: "Tiền đặt cọc" },
  { target: "dishwasher", vi: "Máy rửa bát" },
  { target: "dormitory", vi: "Ký túc xá" },
  { target: "electricity", vi: "Điện" },
  { target: "elevator", vi: "Thang máy" },
  { target: "entrance", vi: "Lối vào" },
  { target: "fireplace", vi: "Lò sưởi" },
  { target: "furniture", vi: "Nội thất (không đếm được)" },
  { target: "garage", vi: "Nhà để xe" },
  { target: "heating", vi: "Hệ thống sưởi" },
  { target: "homestay", vi: "Ở ghép nhà dân" },
  { target: "landlord", vi: "Chủ nhà" },
  { target: "laundry", vi: "Giặt ủi" },
  { target: "mattress", vi: "Nệm (double T, double S)" },
  { target: "microwave", vi: "Lò vi sóng" },
  { target: "neighborhood", vi: "Khu phố" },
  { target: "pillow", vi: "Gối" },
  { target: "refrigerator", vi: "Tủ lạnh (không có chữ D)" },
  { target: "suburb", vi: "Ngoại ô" },
  { target: "tenant", vi: "Người thuê nhà" },
  { target: "vacuum", vi: "Máy hút bụi (1 C, 2 U)" },
  { target: "wardrobe", vi: "Tủ quần áo" },

  // Hotel, Travel & Transport
  { target: "aeroplane", vi: "Máy bay" },
  { target: "baggage", vi: "Hành lý" },
  { target: "bicycle", vi: "Xe đạp" },
  { target: "brochure", vi: "Tờ rơi giới thiệu" },
  { target: "caravan", vi: "Xe nhà lưu động" },
  { target: "cathedral", vi: "Nhà thờ lớn" },
  { target: "chauffeur", vi: "Tài xế riêng" },
  { target: "Check-in", vi: "Làm thủ tục nhận phòng" },
  { target: "coach", vi: "Xe khách đường dài" },
  { target: "commuter", vi: "Người đi làm hàng ngày" },
  { target: "compartment", vi: "Khoang tàu" },
  { target: "connecting", vi: "Chuyến nối tiếp" },
  { target: "continental", vi: "Bữa sáng kiểu lục địa" },
  { target: "currency", vi: "Tiền tệ" },
  { target: "customs", vi: "Hải quan" },
  { target: "departure", vi: "Khởi hành" },
  { target: "destination", vi: "Điểm đến" },
  { target: "excursion", vi: "Chuyến dã ngoại ngắn" },
  { target: "ferry", vi: "Phà" },
  { target: "fountain", vi: "Đài phun nước" },
  { target: "harbour", vi: "Bến cảng" },
  { target: "helicopter", vi: "Trực thăng" },
  { target: "itinerary", vi: "Lịch trình chuyến đi" },
  { target: "junction", vi: "Giao lộ / Ngã ba" },
  { target: "luggage", vi: "Hành lý (double G)" },
  { target: "motorcycle", vi: "Xe mô tô" },
  { target: "museum", vi: "Bảo tàng" },
  { target: "opposite", vi: "Đối diện" },
  { target: "passengers", vi: "Hành khách" },
  { target: "passport", vi: "Hộ chiếu" },
  { target: "pavement", vi: "Vỉa hè" },
  { target: "pedestrian", vi: "Người đi bộ" },
  { target: "platform", vi: "Sân ga" },
  { target: "reception", vi: "Quầy lễ tân" },
  { target: "receptionist", vi: "Nhân viên lễ tân" },
  { target: "refreshments", vi: "Đồ ăn thức uống nhẹ" },
  { target: "reservation", vi: "Đặt chỗ trước" },
  { target: "roundabout", vi: "Bùng binh / Vòng xuyến" },
  { target: "souvenir", vi: "Quà lưu niệm" },
  { target: "suitcase", vi: "Va li" },
  { target: "terminal", vi: "Nhà ga sân bay" },
  { target: "timetable", vi: "Bảng giờ tàu xe" },
  { target: "tournament", vi: "Giải đấu" },
  { target: "traffic", vi: "Giao thông" },
  { target: "underground", vi: "Tàu điện ngầm" },
  { target: "vehicle", vi: "Phương tiện (chữ H câm)" },

  // Health, Food & Fitness
  { target: "allergy", vi: "Dị ứng" },
  { target: "ambulance", vi: "Xe cứu thương" },
  { target: "antibiotics", vi: "Thuốc kháng sinh" },
  { target: "appointment", vi: "Cuộc hẹn khám" },
  { target: "badminton", vi: "Cầu lông" },
  { target: "Blood pressure", vi: "Huyết áp" },
  { target: "breathing", vi: "Hô hấp" },
  { target: "cafeteria", vi: "Nhà ăn tự phục vụ" },
  { target: "calcium", vi: "Canxi" },
  { target: "canteen", vi: "Căn tin" },
  { target: "cheese", vi: "Phô mai" },
  { target: "chocolate", vi: "Sô cô la" },
  { target: "cholesterol", vi: "Cholesterol" },
  { target: "cycling", vi: "Đạp xe" },
  { target: "dentist", vi: "Nha sĩ" },
  { target: "dessert", vi: "Món tráng miệng (double S)" },
  { target: "diabetes", vi: "Bệnh tiểu đường" },
  { target: "dietician", vi: "Chuyên gia dinh dưỡng" },
  { target: "disease", vi: "Bệnh tật" },
  { target: "emergency", vi: "Khẩn cấp" },
  { target: "exercise", vi: "Tập thể dục" },
  { target: "fitness", vi: "Thể hình" },
  { target: "gymnasium", vi: "Phòng tập thể dục" },
  { target: "headache", vi: "Đau đầu" },
  { target: "infection", vi: "Nhiễm trùng" },
  { target: "ingredients", vi: "Nguyên liệu nấu ăn" },
  { target: "injection", vi: "Mũi tiêm" },
  { target: "injury", vi: "Chấn thương" },
  { target: "instructor", vi: "Huấn luyện viên" },
  { target: "medicine", vi: "Thuốc" },
  { target: "muscle", vi: "Cơ bắp (chữ C câm)" },
  { target: "nutrition", vi: "Dinh dưỡng" },
  { target: "organic", vi: "Hữu cơ" },
  { target: "ointment", vi: "Thuốc mỡ" },
  { target: "painkillers", vi: "Thuốc giảm đau" },
  { target: "pharmacy", vi: "Hiệu thuốc" },
  { target: "physician", vi: "Bác sĩ" },
  { target: "prescription", vi: "Đơn thuốc" },
  { target: "protein", vi: "Chất đạm" },
  { target: "restaurant", vi: "Nhà hàng" },
  { target: "seafood", vi: "Hải sản" },
  { target: "shoulder", vi: "Vai" },
  { target: "stomach", vi: "Dạ dày" },
  { target: "stretching", vi: "Giãn cơ" },
  { target: "surgeon", vi: "Bác sĩ phẫu thuật" },
  { target: "swimming", vi: "Bơi lội" },
  { target: "symptoms", vi: "Triệu chứng" },
  { target: "temperature", vi: "Nhiệt độ / Sốt" },
  { target: "therapy", vi: "Trị liệu" },
  { target: "throat", vi: "Cổ họng" },
  { target: "treatment", vi: "Điều trị" },
  { target: "vaccine", vi: "Vắc xin" },
  { target: "vegetables", vi: "Rau củ" },
  { target: "vegetarian", vi: "Ăn chay" },
  { target: "vitamins", vi: "Vitamin" },
  { target: "yoga", vi: "Yoga" },

  // Work, Study, Finance & Events
  { target: "accountant", vi: "Kế toán" },
  { target: "advertisement", vi: "Quảng cáo" },
  { target: "application", vi: "Đơn đăng ký" },
  { target: "architect", vi: "Kiến trúc sư" },
  { target: "architecture", vi: "Kiến trúc" },
  { target: "assessment", vi: "Đánh giá (4 chữ S)" },
  { target: "assignment", vi: "Bài tập lớn" },
  { target: "assistant", vi: "Trợ lý" },
  { target: "attendance", vi: "Điểm danh / Sự có mặt" },
  { target: "auditorium", vi: "Hội trường lớn" },
  { target: "beginner", vi: "Người mới bắt đầu" },
  { target: "bibliography", vi: "Danh mục tài liệu tham khảo" },
  { target: "cancelled", vi: "Đã hủy" },
  { target: "cashier", vi: "Thu ngân" },
  { target: "catalogue", vi: "Danh mục sản phẩm" },
  { target: "ceremony", vi: "Buổi lễ" },
  { target: "certificate", vi: "Chứng chỉ" },
  { target: "chairman", vi: "Chủ tịch" },
  { target: "chemistry", vi: "Hóa học" },
  { target: "colleague", vi: "Đồng nghiệp" },
  { target: "Commerce", vi: "Thương mại" },
  { target: "commission", vi: "Tiền hoa hồng (double M, double S)" },
  { target: "committee", vi: "Ủy ban (double M, double T, double E)" },
  { target: "communication", vi: "Giao tiếp" },
  { target: "competition", vi: "Cuộc thi" },
  { target: "computers", vi: "Máy tính" },
  { target: "concert", vi: "Buổi hòa nhạc" },
  { target: "conference", vi: "Hội nghị" },
  { target: "counselor", vi: "Cố vấn" },
  { target: "curriculum", vi: "Chương trình học" },
  { target: "customer", vi: "Khách hàng" },
  { target: "deadline", vi: "Hạn chót" },
  { target: "department", vi: "Phòng ban / Khoa" },
  { target: "dictionary", vi: "Từ điển" },
  { target: "diploma", vi: "Bằng cấp" },
  { target: "director", vi: "Giám đốc" },
  { target: "discount", vi: "Giảm giá" },
  { target: "dissertation", vi: "Luận văn" },
  { target: "documentary", vi: "Phim tài liệu" },
  { target: "economics", vi: "Kinh tế học" },
  { target: "engineering", vi: "Kỹ thuật" },
  { target: "enrollment", vi: "Ghi danh" },
  { target: "entertainment", vi: "Giải trí" },
  { target: "environment", vi: "Môi trường (có chữ N trước M)" },
  { target: "equipment", vi: "Trang thiết bị" },
  { target: "exhibition", vi: "Triển lãm (chữ H câm)" },
  { target: "experiment", vi: "Thí nghiệm" },
  { target: "facilities", vi: "Cơ sở vật chất" },
  { target: "february", vi: "Tháng Hai (Feb-ru-ary)" },
  { target: "feedback", vi: "Phản hồi" },
  { target: "festival", vi: "Lễ hội" },
  { target: "financial", vi: "Tài chính" },
  { target: "geography", vi: "Địa lý" },
  { target: "government", vi: "Chính phủ (có chữ N trước M)" },
  { target: "graduation", vi: "Lễ tốt nghiệp" },
  { target: "guarantee", vi: "Bảo hành / Cam kết" },
  { target: "headquarters", vi: "Trụ sở chính" },
  { target: "history", vi: "Lịch sử" },
  { target: "information", vi: "Thông tin" },
  { target: "insurance", vi: "Bảo hiểm" },
  { target: "intermediate", vi: "Trung cấp" },
  { target: "interview", vi: "Phỏng vấn" },
  { target: "invoice", vi: "Hóa đơn" },
  { target: "journalism", vi: "Báo chí" },
  { target: "journalist", vi: "Nhà báo" },
  { target: "knowledge", vi: "Kiến thức" },
  { target: "laboratory", vi: "Phòng thí nghiệm" },
  { target: "language", vi: "Ngôn ngữ" },
  { target: "leaflet", vi: "Tờ rơi" },
  { target: "lecturer", vi: "Giảng viên" },
  { target: "library", vi: "Thư viện" },
  { target: "licence", vi: "Giấy phép / Bằng lái" },
  { target: "literature", vi: "Văn học" },
  { target: "magazine", vi: "Tạp chí" },
  { target: "maintenance", vi: "Bảo trì (main-ten-ance)" },
  { target: "management", vi: "Quản lý" },
  { target: "manager", vi: "Người quản lý" },
  { target: "marketing", vi: "Tiếp thị" },
  { target: "mathematics", vi: "Toán học" },
  { target: "mechanic", vi: "Thợ máy" },
  { target: "membership", vi: "Thẻ thành viên" },
  { target: "microscope", vi: "Kính hiển vi" },
  { target: "minimum", vi: "Tối thiểu" },
  { target: "mortgage", vi: "Khoản vay thế chấp (chữ T câm)" },
  { target: "musician", vi: "Nhạc sĩ" },
  { target: "newspaper", vi: "Báo giấy" },
  { target: "notification", vi: "Thông báo" },
  { target: "occupation", vi: "Nghề nghiệp" },
  { target: "orchestra", vi: "Dàn nhạc giao hưởng" },
  { target: "organisation", vi: "Tổ chức" },
  { target: "orientation", vi: "Buổi định hướng" },
  { target: "packaging", vi: "Bao bì" },
  { target: "parliament", vi: "Quốc hội" },
  { target: "participant", vi: "Người tham gia" },
  { target: "partnership", vi: "Quan hệ đối tác" },
  { target: "payment", vi: "Thanh toán" },
  { target: "pension", vi: "Lương hưu" },
  { target: "percentage", vi: "Tỷ lệ phần trăm" },
  { target: "performance", vi: "Buổi biểu diễn / Hiệu suất" },
  { target: "Permanent", vi: "Lâu dài / Cố định" },
  { target: "philosophy", vi: "Triết học" },
  { target: "photograph", vi: "Bức ảnh" },
  { target: "photographer", vi: "Nhiếp ảnh gia" },
  { target: "photography", vi: "Nhiếp ảnh" },
  { target: "presentation", vi: "Bài thuyết trình" },
  { target: "principal", vi: "Hiệu trưởng" },
  { target: "professor", vi: "Giáo sư (1 F, 2 S)" },
  { target: "psychology", vi: "Tâm lý học (chữ P đầu câm)" },
  { target: "qualification", vi: "Bằng cấp chuyên môn" },
  { target: "questionnaire", vi: "Bảng câu hỏi khảo sát (double N)" },
  { target: "receipt", vi: "Biên lai (chữ P câm)" },
  { target: "reference", vi: "Người/Thư giới thiệu" },
  { target: "refund", vi: "Hoàn tiền" },
  { target: "registration", vi: "Đăng ký" },
  { target: "rehearsal", vi: "Buổi diễn tập" },
  { target: "replacement", vi: "Sự thay thế" },
  { target: "representative", vi: "Người đại diện" },
  { target: "requirement", vi: "Yêu cầu" },
  { target: "research", vi: "Nghiên cứu" },
  { target: "resources", vi: "Tài nguyên / Nguồn lực" },
  { target: "responsibility", vi: "Trách nhiệm" },
  { target: "retirement", vi: "Nghỉ hưu" },
  { target: "salary", vi: "Tiền lương" },
  { target: "saturday", vi: "Thứ Bảy" },
  { target: "schedule", vi: "Lịch trình" },
  { target: "scholarship", vi: "Học bổng" },
  { target: "scientist", vi: "Nhà khoa học" },
  { target: "sculpture", vi: "Điêu khắc" },
  { target: "secretary", vi: "Thư ký" },
  { target: "security", vi: "An ninh" },
  { target: "semester", vi: "Học kỳ" },
  { target: "seminar", vi: "Hội thảo chuyên đề" },
  { target: "separate", vi: "Riêng biệt (sep-a-rate)" },
  { target: "signature", vi: "Chữ ký" },
  { target: "specialist", vi: "Chuyên gia" },
  { target: "statistics", vi: "Thống kê" },
  { target: "strategy", vi: "Chiến lược" },
  { target: "subscription", vi: "Đăng ký định kỳ" },
  { target: "supervisor", vi: "Người giám sát" },
  { target: "technology", vi: "Công nghệ" },
  { target: "technician", vi: "Kỹ thuật viên" },
  { target: "telephone", vi: "Điện thoại" },
  { target: "temporary", vi: "Tạm thời" },
  { target: "textbook", vi: "Sách giáo khoa" },
  { target: "theatre", vi: "Nhà hát" },
  { target: "thursday", vi: "Thứ Năm" },
  { target: "training", vi: "Đào tạo" },
  { target: "transfer", vi: "Chuyển khoản / Chuyển tuyến" },
  { target: "translation", vi: "Bản dịch" },
  { target: "treasurer", vi: "Thủ quỹ" },
  { target: "tuition", vi: "Học phí" },
  { target: "tutorial", vi: "Buổi hướng dẫn nhóm nhỏ" },
  { target: "uniform", vi: "Đồng phục" },
  { target: "university", vi: "Trường đại học" },
  { target: "vacancy", vi: "Vị trí tuyển dụng trống" },
  { target: "volunteer", vi: "Tình nguyện viên" },
  { target: "warehouse", vi: "Nhà kho" },
  { target: "wednesday", vi: "Thứ Tư (chữ D câm)" },
  { target: "workshop", vi: "Buổi thực hành / Xưởng" },
];

export function generateWordPrompt() {
  const item = pickRandom(PART1_WORDS_LIST);
  const spell = wordToSpellingTts(item.target);
  return {
    target: item.target.toLowerCase(),
    display: item.target.toLowerCase(),
    tts: item.target.toLowerCase(),
    slowTts: spell,
    accepted: [item.target.toLowerCase()],
    hint: `Nghĩa: ${item.vi} • Đánh vần: ${spell}`,
    label: `Từ vựng Part 1 (${PART1_WORDS_LIST.length} từ)`,
  };
}

// ---------------------------------------------------------------------------
// SMART GRADING
// ---------------------------------------------------------------------------
export function normalizeForMode(str, mode) {
  const base = (str || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (mode === "phone") {
    return base.replace(/[\s\-().]/g, "");
  }
  if (mode === "number") {
    return base.replace(/[\s,]/g, "");
  }
  if (mode === "address") {
    return base.replace(/[,]/g, "").replace(/\s+/g, " ");
  }
  return base.replace(/[,]/g, "").replace(/\s+/g, " ");
}

export function checkDrillAnswer(userInput, promptObj, mode) {
  if (!promptObj) return false;
  const userNorm = normalizeForMode(userInput, mode);
  if (!userNorm) return false;
  const candidates = promptObj.accepted || [promptObj.target];
  return candidates.some((ans) => normalizeForMode(ans, mode) === userNorm);
}
