import { LoaderArgs, redirect } from "@remix-run/node";
import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useFetcher } from "react-router-dom";
import Editor from "~/components/Editor";
import Nav from "~/components/Nav";
import { useKey } from "~/hooks/useKey";
import { db } from "~/utils/db.server";
import { FiFileText } from 'react-icons/fi'
import { detectLanguage } from "~/utils/detectLang";
import { userPrefs } from "~/cookies";
import { v4 as uuidv4 } from 'uuid';



export const meta: V2_MetaFunction = () => {
  return [{ title: "FastPaste" }];
};

export async function action({ request }: ActionArgs) {
  const data = await request.formData()

  // get cookie
  const cookieHeader = request.headers.get('Cookie')
  let cookie = await userPrefs.parse(cookieHeader)
  if (!cookie?.session) {
    cookie = { session: uuidv4() }
  }

  const content = data.get('content') as string
  var languageId = ''
  try {
    languageId = await detectLanguage(content)
  } catch { }
  const { id } = await db.code.create({
    data: { content, language: languageId, session: cookie.session },
    select: { id: true }
  })
  return redirect(`/p/${id}`, { headers: { 'Set-Cookie': await userPrefs.serialize(cookie) } })
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
          {fetcher.state === 'idle' && <FiFileText className="mr-2 text-xl font-bold" />}
          {
            fetcher.state !== 'idle' && (
              <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
              </svg>
            )
          }
          <span>Create</span>
        </button>
      </Nav>
      <Editor autoFocus={true} onChange={(value, viewUpdate) => setCode(value)} />
    </div>
  );
}
