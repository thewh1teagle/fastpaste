import { Link } from "@remix-run/react";
import React from "react";

export default function Nav({children}: {children: React.ReactNode}) {
    return (
        <div className="flex w-full h-14 flex-row text-zinc-100 justify-center items-center" style={{background: '#252526'}}>
            <Link reloadDocument={true} to='/' className="absolute left-0 pl-5 text-lg font-medium" style={{color: '#23a9f2'}}>
                FastPaste

            </Link>
            {children}
        </div>
    )
}