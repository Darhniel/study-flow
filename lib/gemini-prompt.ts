interface PromptInput {
    title: string;
    content: string;
}

export function buildStudyMaterialPrompt({ title, content }: PromptInput): string {
    return `You are an expert educational assistant. Analyze the student's study note below and produce study material.

STRICT RULES:
- Use ONLY information contained in the note. Do not invent facts, add external information, or speculate.
- If the note is too short or empty to produce meaningful material, return minimal but honest output based on what is present.
- Be concise, clear, and educational.
- Match the difficulty level of the note. Do not make questions unnecessarily difficult unless the note itself is advanced.
- Identify the most important concepts for the key points.
- Produce exactly 5 quiz questions that test understanding of the note. Each question must have a clear, correct answer derived from the note.

Return your response as valid JSON with this exact shape:
{
  "summary": "A 2-4 sentence summary of the main ideas in the note.",
  "keyPoints": ["key point 1", "key point 2", "..."],
  "quizQuestions": [
    { "question": "Question text?", "answer": "Answer text." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}

Note title: ${title}

--- BEGIN NOTE CONTENT ---
${content}
--- END NOTE CONTENT ---`;
}