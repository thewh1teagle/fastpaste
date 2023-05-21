import { json, type LoaderFunction, type LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import Editor from "~/components/Editor"
import Nav from "~/components/Nav"
import CopyToolTip from "~/components/Tooltip"
import { db } from "~/utils/db.server"
import { IoCopyOutline } from 'react-icons/io5'

export const loader: LoaderFunction = async ({ params }: LoaderArgs) => {
    const { id } = params
    const code = await db.code.findFirst({ where: { id } })
    return json({ code })
}

export default function PasteRoute() {
    const { code } = useLoaderData<typeof loader>()

    function onCopyURL() {
        navigator.clipboard.writeText(location.href)
    }

    function onCopyCode() {
        navigator.clipboard.writeText(code.content)
    }
    
    var translatedLanguage = 'python'
    switch(translatedLanguage) {
        case 'py':
            translatedLanguage = 'python'
            break
        case 'ts':
            translatedLanguage = 'typescript'
            break
        case 'js':
            translatedLanguage = 'javascript'
    }
    return (
        <div className="bg-slate-200" style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
            <Nav>
                <div className="flex flex-row gap-5">
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
                </div>
            </Nav>
            <Editor autoFocus={false} value={code.content} readOnly={true} lang={translatedLanguage ?? 'python'} />
        </div>
    )
}