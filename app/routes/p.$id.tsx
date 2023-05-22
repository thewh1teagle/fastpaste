import { json, type LoaderFunction, type LoaderArgs, ActionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react"
import Editor from "~/components/Editor"
import Nav from "~/components/Nav"
import CopyToolTip from "~/components/Tooltip"
import { db } from "~/utils/db.server"
import { IoCopyOutline } from 'react-icons/io5'
import { userPrefs } from "~/cookies"
import { useEffect, useState } from "react"
import { detectLanguage } from "~/utils/detectLang"
import { Prisma } from "@prisma/client"
import type { code } from "@prisma/client"
import { TbEdit } from 'react-icons/tb'
import { FiSave } from 'react-icons/fi'
import { useKey } from "~/hooks/useKey"

export async function action({ request }: ActionArgs) {
    const data = await request.formData()
    const id = data.get('id') as string
    const newContent = data.get('content') as string

    const code = await db.code.findFirst({ where: { id } })

    if (code) {
        // get cookie
        const cookieHeader = request.headers.get('Cookie')
        let cookie = await userPrefs.parse(cookieHeader)
        if (cookie?.session === code.session) {
            var languageId = ''
            try {
                languageId = await detectLanguage(newContent)
            } catch { }
            const newData = {
                content: newContent,
                language: languageId,
            }
            await db.code.update({ where: { id }, data: newData })
            return json(null, { status: 200 })
        } else { // not authorized
            return json(null, { status: 403 })
        }
    } else { // not found
        return json(null, { status: 404 })
    }
}


export const loader: LoaderFunction = async ({ request, params }: LoaderArgs) => {

    const cookieHeader = request.headers.get('Cookie')
    let cookie = await userPrefs.parse(cookieHeader)
    const { id } = params
    const code = await db.code.findFirst({ where: { id } })
    const codeWithoutSession = { content: code?.content, language: code?.language, id: code?.id }
    const owner = code?.session === cookie?.session
    return json({ code: codeWithoutSession, owner })
}

export default function PasteRoute() {
    const { code, owner } = useLoaderData<typeof loader>()
    const [content, setContent] = useState<string>(code.content)
    const [edit, setEdit] = useState(false)
    const fetcher = useFetcher()

    const { hash } = useLocation()
    
    const lineNumber = Number(hash.slice(2))



    function onCopyURL() {
        navigator.clipboard.writeText(location.href)
    }

    function onCopyCode() {
        navigator.clipboard.writeText(code.content)
    }
    function onEditClick() {
        setEdit(true)
    }
    function onSaveClick() {
        setEdit(false)
        fetcher.submit({ content, id: code.id }, { action: '.', method: 'POST' })
    }

    var translatedLanguage = 'python'
    switch (translatedLanguage) {
        case 'py':
            translatedLanguage = 'python'
            break
        case 'ts':
            translatedLanguage = 'typescript'
            break
        case 'js':
            translatedLanguage = 'javascript'
    }
    useKey('ctrls', onSaveClick, true)
    useKey('ctrle', onEditClick, true)

    return (
        <div className="bg-slate-200" style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
            <Nav>
                <div className="flex flex-row gap-5 items-center">
                    <CopyToolTip>
                        <div onClick={onCopyURL} className="text-white flex flex-row gap-1 items-center cursor-pointer hover:text-blue-300">
                            <IoCopyOutline />
                            URL
                        </div>
                    </CopyToolTip>
                    <CopyToolTip>
                        <div onClick={onCopyCode} className="text-white flex flex-row gap-1 items-center cursor-pointer hover:text-blue-300">
                            <IoCopyOutline />
                            CODE
                        </div>
                    </CopyToolTip>
                    {fetcher.state === 'idle' && owner && !edit && (

                        <TbEdit className="text-xl cursor-pointer" onClick={onEditClick}>edit</TbEdit>
                    )}
                    {fetcher.state === 'idle' && owner && edit && (
                        <FiSave className="text-xl cursor-pointer" onClick={onSaveClick}>save</FiSave>
                    )}
                    {owner && fetcher.state !== 'idle' && (
                        <div role="status">
                            <svg aria-hidden="true" className="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    )}

                </div>
            </Nav>
            <Editor initialLine={lineNumber ?? undefined} onSelectLine={n => {
                window.location.hash = `L${n}`
            }} autoFocus={edit} value={content} onChange={(value) => setContent(value)} readOnly={edit === false} lang={translatedLanguage ?? 'python'} />
        </div>
    )
}