import { drizzle } from 'drizzle-orm/libsql';
import { Config, createClient } from '@libsql/client/http';
import * as schema from "@drizzle/schema";
import env from '@/env.mjs';
import { eq, isNull } from 'drizzle-orm';
import { gradeEssay } from '@/ai/utils';

const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN } as Config);

export const db = drizzle(client, { schema });

export async function gradeEssays() {
  const essays = await db.select().from(schema.essays).where(isNull(schema.essays.aiResponse));
  
  const promises : Promise<void>[] = [];
  for (const essay of essays) {
    promises.push(new Promise(resolve => {
      return gradeEssay(essay.question, essay.answer).then(aiResponse => {
        return db.update(schema.essays).set({
          aiResponse: aiResponse
        }).where(eq(schema.essays.id, essay.id)).run();
      }).then(() => resolve());
    }))
  }

  await Promise.all(promises);
  return true;
}