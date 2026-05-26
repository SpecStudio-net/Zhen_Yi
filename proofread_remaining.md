# Findings not auto-applied

These need manual review — typically multi-line quotes, false positives, or quotes the LLM paraphrased.

## Hexagram 2. Kūn / The Receptive
**Quote:** `the broken lines represents the dark`
**Suggested:** `the broken lines represent the dark`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

## Hexagram 7. Shī / The Army
**Quote:** `trig rams are danger`
**Suggested:** `trigrams are danger`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

## Hexagram 9. Xiǎo Xù / The Taming Power of the Small
**Quote:** `a fixed standpoint has been reach`
**Suggested:** `a fixed standpoint has been reached`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

## Hexagram 10. Lǚ / Treading [conduct]
**Quote:** `A lame man is able to tread. ⏎ He treads on the tail of the tiger. ⏎  ⏎ The tiger bites the man. Misfortune. ⏎  ⏎ Thus does a warrior act on behalf of his great prince. ⏎  ⏎ A one-eyed man can indeed see, but not enough for clear vision. A lame man can indeed treat,`
**Suggested:** `tread`
**Reason:** multi-line quote — review manually
**LLM rationale:** multi-line quote — review manually

## Hexagram 12. Pǐ / Standstill [Stagnation]
**Quote:** `he sets himself up a capable of creating order`
**Suggested:** `he sets himself up as capable of creating order`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

## Hexagram 30. Lí / The Clinging, Fire
**Quote:** `While KÇn means the soul shut within the body`
**Suggested:** `While Kǎn means the soul shut within the body`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

## Hexagram 34. Dà Zhuàng / The Power of the Great
**Quote:** `the lower is ch'ien, the Creative`
**Suggested:** `the lower is Qián, the Creative`
**Reason:** skip-list (stylistic, not a typo)
**LLM rationale:** skip-list (stylistic, not a typo)

## Hexagram 44. Gòu / Coming to Meet
**Quote:** `the ruler is far form his people`
**Suggested:** `the ruler is far from his people`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

## Hexagram 48. Jǐng / The Well
**Quote:** `it grows neither less not more`
**Suggested:** `it grows neither less nor more`
**Reason:** quote not found in either file
**LLM rationale:** quote not found in either file

---

# Medium and low confidence findings (review manually)

## Hexagram 2. Kūn / The Receptive  _(medium)_
- **`the way-but to let`** → **`the way—but to let`**  — Hyphen used where an em dash is expected, consistent with the rest of the text's punctuation style

## Hexagram 2. Kūn / The Receptive  _(medium)_
- **`that symbolized the inflation`** → **`that symbolizes the inflation`**  — Tense inconsistency; surrounding text uses present tense

## Hexagram 4. Méng / Youthful Folly  _(medium)_
- **`who subordinated himself to his teacher`** → **`who subordinates himself to his teacher`**  — Verb tense inconsistency; should be present tense 'subordinates' to match surrounding context

## Hexagram 7. Shī / The Army  _(medium)_
- **`the king divided estates`** → **`the king divides estates`**  — Present tense 'divides' is consistent with the interpretive commentary style used throughout; 'divided' may be a tense substitution error

## Hexagram 10. Lǚ / Treading [conduct]  _(medium)_
- **`composure correct social conduct, depends`** → **`composure, correct social conduct, depends`**  — Missing comma after 'composure' disrupts the intended punctuation grouping

## Hexagram 10. Lǚ / Treading [conduct]  _(low)_
- **`because it happened in good humor`** → **`because it happens in good humor`**  — Possible tense inconsistency, though could be intentional in context

## Hexagram 11. Tài / Peace  _(low)_
- **`the lowly and inferior is an end to all feuds`** → **`the lowly and inferior in an end to all feuds`**  — Phrase seems garbled; likely should read something like 'there is an end to all feuds' — 'and inferior is' may be a substitution or OCR error for 'there is'

## Hexagram 17. Suí / Following  _(medium)_
- **`because he seeks and needs for the development of his personality`** → **`because he seeks and finds what he needs for the development of his personality`**  — Sentence appears to be missing words; 'seeks and needs' is likely 'seeks and finds what he needs'

## Hexagram 22. Bì / Grace  _(medium)_
- **`and therefore be used sparingly`** → **`and therefore should be used sparingly`**  — Missing word 'should' — the sentence lacks a verb after 'therefore'

## Hexagram 23. Bō / Splitting Apart  _(medium)_
- **`it is just when the fruit falls to the ground that food sprouts anew from its seed`** → **`it is just when the fruit falls to the ground that good sprouts anew from its seed`**  — 'food' is likely a misread/OCR error for 'good', fitting the context of the good seed/principle being preserved

## Hexagram 31. Xián / Influence (Wooing)  _(medium)_
- **`What takes place in the depths of one's being, in the unconscious mind. It is true that`** → **`What takes place in the depths of one's being, in the unconscious mind, it is true that`**  — Period after 'unconscious mind' creates a sentence fragment; likely should be a comma connecting the two clauses.

## Hexagram 35. Jìn / Progress  _(low)_
- **`[PARSE ERROR]`** → **``**  — Could not parse model output: ```json

## Hexagram 37. Jiā Rén / The Family [The Clan]  _(medium)_
- **`For there is nothing easily avoided and more difficult to carry through`** → **`For there is nothing more easily avoided and more difficult to carry through`**  — Missing word 'more' before 'easily' to complete the comparative construction

## Hexagram 44. Gòu / Coming to Meet  _(low)_
- **`fall to his disposition`** → **`fall to his disposition`**  — Possibly 'fall into his disposition' but may be intentional archaic phrasing; low confidence

## Hexagram 45. Cuì / Gathering Together [Massing]  _(medium)_
- **`there is no need of great deeds`** → **`there is need of great deeds`**  — The 'no' appears to invert the intended meaning; the passage is affirming that great deeds are needed in times of gathering together

## Hexagram 46. Shēng / Pushing Upward  _(medium)_
- **`This situation at the beginning of ascent.`** → **`This is the situation at the beginning of ascent.`**  — Missing words 'is the' — likely an OCR drop resulting in a fragment where a complete sentence was intended.

## Hexagram 52. Gèn / Keeping Still, Mountain  _(low)_
- **`keeping the ego, with its thoughts and impulses, in a state of rest, is not yet quite liberated from its dominance`** → **`keeping the ego, with its thoughts and impulses, in a state of rest, is not yet quite free from its dominance`**  — Possible phrasing issue but may be intentional; low confidence as it could be original text

## Hexagram 52. Gèn / Keeping Still, Mountain  _(low)_
- **`Line Six at the beginning`** → **`Line Six at the beginning`**  — Possibly should be 'Line Nine at the beginning' — other bottom lines in similar hexagrams are Nine, but without cross-reference cannot be certain

## Hexagram 53. Jiàn / Development (Gradual Progress)  _(medium)_
- **`Line Six at the beginning`** → **`Line One at the beginning`**  — The bottom line of a hexagram is typically a Yang (Nine) or Yin (Six) line; checking consistency — other numbered lines use 'Nine' or 'Six' correctly, but 'Six at the beginning' may be correct if it is a yin line. Low priority; skipping.

## Hexagram 58. Duì / The Joyous, Lake  _(low)_
- **`intimidation without gentleness may achieve something momentarily`** → **`intimidation without gentleness may achieve something momentarily`**  — No error found here; leaving as-is.

## Hexagram 61. Zhōng Fú / Inner Truth  _(low)_
- **`[PARSE ERROR]`** → **``**  — Could not parse model output: ```json

## Hexagram 62. Xiǎo Guò / Preponderance of the Small  _(medium)_
- **`in exceptional times there may be a born ruler`** → **`in such exceptional times there may be a born ruler`**  — Likely missing word 'such' to match the parallel phrasing 'Is such times' in the next sentence, though 'Is' is itself an error

## Hexagram 62. Xiǎo Guò / Preponderance of the Small  _(low)_
- **`extraordinary salience of small things`** → **`extraordinary prevalence of small things`**  — 'salience' is unusual here and may be a wrong-word substitution, though it is not clearly a typo

## Hexagram 64. Wèi Jì / Before Completion  _(low)_
- **`[PARSE ERROR]`** → **``**  — Could not parse model output: ```json
