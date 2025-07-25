
import { GoogleGenAI, Type } from "@google/genai";
import { UserInfo, InterviewAnswer, InterviewQuestion, EvaluationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionGenerationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING },
      },
      required: ["id", "question"],
    },
};

export const generateQuestions = async (userInfo: UserInfo): Promise<InterviewQuestion[]> => {
    const languageName = userInfo.language === 'en-US' ? 'English' : 'Kinyarwanda';

    const prompt = `
      Based on the following user information, generate 5 relevant interview questions.
      - **Role:** ${userInfo.position}
      - **Company:** ${userInfo.companyName}
      - **Company Website:** ${userInfo.companyWebsite}
      - **Interview Purpose:** ${userInfo.purpose}
      - **Language:** ${languageName}

      The questions should be tailored to the role and company. They must be in ${languageName}.
      The questions should cover a mix of technical skills, behavioral situations, and company-specific knowledge.
      Return the questions as a JSON array of objects, where each object has an "id" and a "question" field.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionGenerationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        return questions;

    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Failed to generate interview questions from AI.");
    }
};


const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.NUMBER,
            description: "An overall score from 0 to 100 based on all answers."
        },
        decision: {
            type: Type.STRING,
            description: "A hiring decision string. Either 'You passed the interview. You’re qualified for the role.' or 'You were not selected, but here are recommendations to improve.'"
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 key strengths demonstrated in the user's answers."
        },
        weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 key weaknesses or areas where answers could be improved."
        },
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 actionable recommendations for the user to improve."
        }
    },
    required: ["overallScore", "decision", "strengths", "weaknesses", "recommendations"],
};


export const evaluateAnswers = async (userInfo: UserInfo, answers: InterviewAnswer[]): Promise<EvaluationResult> => {
    const languageName = userInfo.language === 'en-US' ? 'English' : 'Kinyarwanda';
    
    const answersFormatted = answers.map(a => `
        Question ${a.questionId}: ${a.question}
        User's Answer: ${a.answer}
    `).join('\n\n');

    const prompt = `
      As an expert HR manager and technical recruiter, evaluate the following interview responses for the role of ${userInfo.position} at ${userInfo.companyName}.
      The interview was conducted in ${languageName}.

      **Interview Context:**
      - **Role:** ${userInfo.position}
      - **Company:** ${userInfo.companyName}
      - **Purpose:** ${userInfo.purpose}

      **User's Answers:**
      ${answersFormatted}

      **Evaluation Criteria:**
      1.  **Relevance:** How well does the answer address the question?
      2.  **Completeness & Depth:** Is the answer detailed and comprehensive?
      3.  **Clarity:** Is the language clear and easy to understand?
      4.  **Confidence & Professionalism:** Does the user sound knowledgeable and professional? (inferred from text)
      5.  **Skills Match:** Does the user demonstrate the skills required for a ${userInfo.position}?

      **Task:**
      Provide a structured evaluation in JSON format.
      - **overallScore:** A single integer score from 0 to 100.
      - **decision:** If the score is >= 75, the decision is "You passed the interview. You’re qualified for the role.". Otherwise, it's "You were not selected, but here are recommendations to improve.".
      - **strengths:** List 2-3 key strengths.
      - **weaknesses:** List 2-3 key weaknesses or areas for improvement.
      - **recommendations:** Provide 2-3 specific, actionable recommendations.

      The entire response (strengths, weaknesses, recommendations) must be in ${languageName}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error evaluating answers:", error);
        throw new Error("Failed to evaluate interview answers with AI.");
    }
};
