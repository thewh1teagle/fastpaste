import React, { useState } from "react";

interface CopyToolTipProps {
    children: React.ReactNode,
    duration?: number
}

export default function CopyToolTip({ children, duration = 1000 }: CopyToolTipProps) {
    const [visible, setVisible] = useState(false)

    function onClick() {
        setVisible(true)
        setTimeout(() => setVisible(false), 1000)
    }

    return (
        <div className="group relative flex justify-center" onClick={onClick}>
            {children}
            <span style={{minWidth: '80px'}} className={`absolute top-10 rounded bg-gray-800 p-2 text-xs text-white ${visible ? 'scale-100' : 'scale-0'} z-10`}>✨ copied!</span>
        </div>
    )
}