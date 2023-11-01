import env from "@/env.mjs";
import { essayType } from "@drizzle/schema";
import OpenAI from "openai";
import { APIPromise } from "openai/core.mjs";
import wait from "wait";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const MESSAGE_FOOTER = `What score would you give to this student in this section? please point out the mistakes that you have found and how he could improve his essay.

Your response should follow this format

section_score: Band <INSERT_SCORE_HERE_IN_NUMBERS>
section_comment: <INSERT_YOUR_COMMENT_HERE>
`;

const SYSTEM_MESSAGE = `You are about to immerse yourself into the role of an IELTS examiner. You will be given an essay question accompanied with its answer to read it throughly then using the following:

The grading methodology consists of 4 parts:

* Task Achievement 
* Coherence and cohesion
* Lexical resource
* Grammatical range and accuracy`;

const formatMessage = (question: string, answer: string) => {
  return `
Exam Question:
\`\`\`
${question}
\`\`\`

student essay answer:
\`\`\`
${answer}
\`\`\`
`
}

const taskRubric = (taskTitle: string, rubric: string) => (question: string, answer: string) => ({
  taskTitle,
  formattedPrompt: `
  ${formatMessage(question, answer).split("\n").map(line => line.trim()).join("\n")}
  
  ${rubric.split("\n").map(line => line.trim()).join("\n")}
  
  ${MESSAGE_FOOTER.split("\n").map(line => line.trim()).join("\n")}
  `
});

export const gradingSteps = [
  taskRubric('task_acheivement', `The Task Achievement rubric is as follows:

  Band 9: The task is fully and appropriately satisfied with no or very rare lapses.
  
  Band 8: The task is appropriately and sufficiently covered with occasional omissions or lapses.
  
  Band 7: The task is covered with relevant and accurate content, but some omissions or lapses may occur. The format and tone are appropriate.
  
  Band 6: The task is focused on, but some irrelevant, inappropriate or inaccurate information may occur. The format and tone may be inconsistent.
  
  Band 5: The task is generally addressed, but the format may be inappropriate and the purpose may be unclear. The content may include irrelevant, inappropriate or inaccurate material.
  
  Band 4: The task is attempted, but not all bullet points are presented. The format, purpose and tone may be inappropriate or confused.
  
  Band 3: The task is not addressed and the content may be largely irrelevant. Limited information is presented repetitively.
  
  Band 2: The content barely relates to the task.
  
  Band 1: The content is unrelated to the task or too short. Any copied rubric is discounted.`),
  taskRubric('coherence_and_cohesion', `The Coherence and cohesion rubric is as follows:

  Band 9: The message is effortless to follow. Cohesion is used very well and rarely noticeable. Paragraphing is skilful.
  
  Band 8: The message is easy to follow. Information and ideas are logically sequenced and cohesion is well managed. Paragraphing is sufficient and appropriate.
  
  Band 7: The message is coherent and clear. Information and ideas are logically organised and progressed. A range of cohesive devices is used flexibly but with some errors.
  
  Band 6: The message is generally coherent and clear. Information and ideas are arranged coherently but with some faults. Cohesive devices are used to some good effect but may be faulty or mechanical.
  
  Band 5: The message is evident but not wholly logical. Information and ideas are not arranged coherently and may lack progression. The relationship of ideas can be followed but not fluently. Cohesive devices are limited or overused with some inaccuracy.
  
  Band 4: The message is unclear and illogical. Information and ideas are not arranged coherently and there is no progression. The relationship of ideas can be unclear or inadequately marked. Cohesive devices are inaccurate or repetitive.
  
  Band 3: The message is unorganised and disjointed. Ideas are discernible but difficult to relate to each other. Cohesive devices are minimal or inappropriate. Referencing is difficult to identify.
  
  Band 2: The message is irrelevant or off-topic. There is little evidence of control of organisational features.
  
  Band 1: The message is nonexistent or by a virtual non-writer.`),
  taskRubric('lexical_resources', `The Lexical resources rubric is as follows:


  Band 9: The vocabulary is wide, precise, natural and sophisticated. Lexical features are very well controlled. Spelling and word formation errors are extremely rare and minimal.
  
  Band 8: The vocabulary is wide, precise and flexible. Uncommon and idiomatic items are used skilfully, despite some inaccuracies. Spelling and word formation errors are occasional and minimal.
  
  Band 7: The vocabulary is sufficient and flexible. Less common and idiomatic items are used with some ability. Style and collocation are aware but inappropriacies occur. Spelling and word formation errors are few and do not detract from clarity.
  
  Band 6: The vocabulary is adequate and appropriate. The meaning is clear but the range is restricted or imprecise. Inaccuracies or inappropriacies may occur if the writer is a risk-taker. Spelling and word formation errors are some but do not impede communication.
  
  Band 5: The vocabulary is limited but minimally adequate. Simple vocabulary is used accurately but does not allow much variation. Inappropriacies, simplifications and repetitions may occur frequently. Spelling and word formation errors may be noticeable and cause some difficulty.
  
  Band 4: The vocabulary is limited and inadequate or unrelated. Vocabulary is basic and repetitive. Inappropriate use of lexical chunks may occur. Inappropriate word choice, word formation and spelling errors may impede meaning.
  
  Band 3: The vocabulary is inadequate or underlength. Over-dependence on input material or memorised language may occur. Word choice, word formation and spelling errors predominate and severely impede meaning.
  
  Band 2: The vocabulary is extremely limited with few recognisable strings. No control of word formation and spelling.
  
  Band 1: The vocabulary is nonexistent or by a virtual non-writer.`),
  taskRubric('grammatical_range_and_accuracy', `The Grammatical range and accuracy rubric is as follows:
  Band 9: The structures are wide, flexible and controlled. Grammar and punctuation are appropriate and error-free. Minor errors are extremely rare and minimal.

Band 8: The structures are wide, flexible and accurate. Most sentences are error-free and punctuation is well managed. Occasional errors and inappropriacies are minimal.

Band 7: The structures are varied and complex with some flexibility and accuracy. Grammar and punctuation are generally well controlled and error-free sentences are frequent. A few errors in grammar may persist but do not impede communication.

Band 6: The structures are a mix of simple and complex but with limited flexibility. Complex structures are less accurate than simple ones. Errors in grammar and punctuation occur but rarely impede communication.

Band 5: The structures are limited and repetitive. Complex sentences are faulty and simple sentences are more accurate. Grammatical errors may be frequent and cause some difficulty. Punctuation may be faulty.

Band 4: The structures are very limited and simple. Subordinate clauses are rare and simple sentences predominate. Some structures are accurate but grammatical errors are frequent and may impede meaning. Punctuation is often faulty or inadequate.

Band 3: The structures are attempted but with predominant errors in grammar and punctuation. This prevents most meaning from coming through. Length may be insufficient to show control of sentence forms.

Band 2: The structures are barely evident except in memorised phrases.

Band 1: The structures are nonexistent or by a virtual non-writer.`)

];

export const gradeEssay = async (question: string, answer: string) => {
  const messages: {
    role: "system" | "user";
    content: string
  }[] = [];

  messages.push({
    role: "system",
    content: SYSTEM_MESSAGE
  });

  const results: essayType["aiResponse"] = [];

  for (const task of gradingSteps) {
    const taskMessages = [...messages];

    const { formattedPrompt, taskTitle } = task(question, answer);

    taskMessages.push({
      role: "user",
      content: formattedPrompt,
    });

    const { choices: [response] } = await openai.chat.completions.create({
      messages: taskMessages,
      model: 'gpt-3.5-turbo',
      max_tokens: 100
    });

    await wait(20000);
    
    results.push({
      taskTitle,
      result: response?.message.content ?? "An error has occured"
    })
  }

  return results;
}