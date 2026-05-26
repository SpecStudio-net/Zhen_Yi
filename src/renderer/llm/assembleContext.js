const SYSTEM_PREAMBLE = `You are a scholar of the Yìjīng (易經), deeply versed in the Wilhelm/Baynes translation and the Chinese cosmological tradition. You assist a practitioner with their reading.

Be precise and grounded in the classical text. Quote exactly when relevant. Illuminate rather than prescribe — help the querent explore what the text opens up in relation to their situation. Do not offer fortune-telling or definitive predictions. Do not explain the I Ching's history or method unless asked.

The reading context below is fixed for this session. All questions refer to it.`;

// Build the system prompt that anchors the conversation to this specific reading.
// question: the querent's original intention string
// reading: the resolved reading object from CastingModule (primary, relating, lines, changing)
export function assembleSystemPrompt(question, reading) {
  const { primary, relating, lines, changing } = reading;
  const allChanging = changing.length === 6;
  const blocks = [SYSTEM_PREAMBLE, '---'];

  if (question) blocks.push(`Question: "${question}"`);

  blocks.push(`Primary hexagram: ${primary.number}. ${primary.pinyin} / ${primary.english}`);

  if (primary.introduction) blocks.push(primary.introduction);

  blocks.push(
    `The Judgment:\n${primary.judgment.verse}` +
    (primary.judgment.commentary ? `\n\n${primary.judgment.commentary}` : ''),
  );

  blocks.push(
    `The Image:\n${primary.image.verse}` +
    (primary.image.commentary ? `\n\n${primary.image.commentary}` : ''),
  );

  if (!allChanging && changing.length > 0) {
    const lineTexts = changing.map(n => {
      const line = primary.lines[n - 1];
      return `${line.position}:\n${line.verse}` +
        (line.commentary ? `\n\n${line.commentary}` : '');
    });
    blocks.push('Changing lines:\n\n' + lineTexts.join('\n\n'));
  }

  if (allChanging && primary.allNines) blocks.push(`When all the lines are nines:\n${primary.allNines}`);
  if (allChanging && primary.allSixes) blocks.push(`When all the lines are sixes:\n${primary.allSixes}`);

  if (relating) {
    blocks.push(
      `Relating hexagram: ${relating.number}. ${relating.pinyin} / ${relating.english}\n\n` +
      `Judgment:\n${relating.judgment.verse}` +
      (relating.judgment.commentary ? `\n\n${relating.judgment.commentary}` : ''),
    );
  }

  return blocks.join('\n\n');
}
