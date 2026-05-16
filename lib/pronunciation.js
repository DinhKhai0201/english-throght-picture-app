import { dictionary } from "cmu-pronouncing-dictionary";

const ipaToVietnameseMap = {
  i: "i",
  "ɪ": "i",
  e: "ê",
  "ɛ": "e",
  "æ": "a",
  "ɑ": "a",
  "ɒ": "o",
  "ɔ": "o",
  "ʊ": "u",
  u: "u",
  "ə": "ờ",
  "ʌ": "â",
  "ɜ": "ơ",
  "aɪ": "ai",
  "aʊ": "ao",
  "ɔɪ": "oi",
  "eɪ": "ây",
  "oʊ": "âu",
  p: "p",
  b: "b",
  t: "t",
  d: "đ",
  k: "k",
  g: "g",
  f: "ph",
  v: "v",
  "θ": "th",
  "ð": "đ",
  s: "s",
  z: "z",
  "ʃ": "sh",
  "ʒ": "gi",
  h: "h",
  m: "m",
  n: "n",
  "ŋ": "ng",
  l: "l",
  r: "r",
  j: "y",
  w: "u",
  "tʃ": "ch",
  "dʒ": "j",
};

const arpabetToIpaMap = {
  // Vowels
  AA: "ɑ",
  AE: "æ",
  AH: "ʌ",
  AO: "ɔ",
  AW: "aʊ",
  AY: "aɪ",
  EH: "ɛ",
  ER: "ɝ",
  EY: "eɪ",
  IH: "ɪ",
  IY: "i",
  OW: "oʊ",
  OY: "ɔɪ",
  UH: "ʊ",
  UW: "u",
  // Consonants
  B: "b",
  CH: "tʃ",
  D: "d",
  DH: "ð",
  F: "f",
  G: "ɡ",
  HH: "h",
  JH: "dʒ",
  K: "k",
  L: "l",
  M: "m",
  N: "n",
  NG: "ŋ",
  P: "p",
  r: "r",
  R: "r",
  S: "s",
  SH: "ʃ",
  T: "t",
  TH: "θ",
  V: "v",
  W: "w",
  Y: "j",
  Z: "z",
  ZH: "ʒ",
};

function normalizeIPA(ipa) {
  return String(ipa)
    .replace(/[ˈˌ/]/g, "")
    .replace(/[.]/g, " ")
    .trim();
}

function ipaToVietnameseApprox(ipa) {
  let text = normalizeIPA(ipa);
  const keys = Object.keys(ipaToVietnameseMap).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    text = text.replaceAll(key, ipaToVietnameseMap[key]);
  }

  return text.replace(/\s+/g, " ").trim();
}

function arpabetToIPAString(arpabet) {
  if (!arpabet) return "";
  return arpabet
    .split(/\s+/)
    .map((token) => {
      const phoneme = token.replace(/[0-9]/g, "").toUpperCase();
      return arpabetToIpaMap[phoneme] || token.toLowerCase();
    })
    .join("");
}

export function getPronunciation(word) {
  const cleanWord = word.trim().toLowerCase().replace(/[.,!?;:]/g, "");
  const arpabet = dictionary[cleanWord];

  if (!arpabet) {
    return {
      word,
      found: false,
      arpabet: null,
      ipa: null,
      vietnameseApprox: null,
    };
  }

  const ipa = arpabetToIPAString(arpabet);
  const vietnameseApprox = ipaToVietnameseApprox(ipa);

  return {
    word,
    found: true,
    arpabet,
    ipa: `/${ipa}/`,
    vietnameseApprox,
  };
}

export function getPhrasePronunciation(input) {
  const tokens = tokenizePhrase(input);
  const items = tokens.map((token) => getPronunciation(token));
  const foundItems = items.filter((item) => item.found);

  return {
    word: input,
    found: foundItems.length > 0,
    arpabet: foundItems.map((item) => item.arpabet).join(" | ") || null,
    ipa: foundItems.map((item) => item.ipa).join(" ") || null,
    vietnameseApprox: foundItems.map((item) => item.vietnameseApprox).join(" ") || null,
    items,
  };
}

function tokenizePhrase(text) {
  return text
    .split(/[^A-Za-z']+/)
    .map((token) => token.replace(/^'+|'+$/g, ""))
    .filter(Boolean);
}
