import { redirect } from "@remix-run/node";
import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useFetcher } from "react-router-dom";
import Editor from "~/components/Editor";
import Nav from "~/components/Nav";
import { useKey } from "~/hooks/useKey";
import { db } from "~/utils/db.server";
import { FiFileText } from 'react-icons/fi'
import { detectLanguage } from "~/utils/detectLang";

export const meta: V2_MetaFunction = () => {
  return [{ title: "FastPaste" }];
};

export async function action({ request }: ActionArgs) {
  const data = await request.formData()
  const content = data.get('content') as string
  var languageId = ''
  try {
    languageId = await detectLanguage(content)
  } catch {}
  const { id } = await db.code.create({
    data: { content, language: languageId },
    select: { id: true }
  })
  return redirect(`/p/${id}`)
}

export default function Index() {
  const [code, setCode] = useState('')
  const fetcher = useFetcher()

  async function onClick() {
    if (!code) {
      return
    }
    fetcher.submit({ content: code }, { action: '.', method: 'POST' })
  }

  useKey('ctrls', (event) => onClick(), true) // save on ctrl + s

  return (
    <div className="bg-slate-200" style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <Nav>
        <button onClick={onClick} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center h-8">
          <FiFileText className="mr-2 text-xl font-bold" />
          <span>Create</span>
        </button>
      </Nav>
      <Editor onChange={(value, viewUpdate) => setCode(value)} />
    </div>
  );
}
