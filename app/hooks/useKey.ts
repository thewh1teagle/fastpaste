import { useEffect, useRef } from "react";

export function useKey(key: string, cb: (event: any) => void, preventDefault = false) {
    const callback = useRef(cb);

    useEffect(() => {
        callback.current = cb;
    })


    useEffect(() => {
        function handle(event: any) {
            var catched = false
            if (event.code === key) {
                callback.current(event);
                catched = true
            }
            else if (key === 'ctrls' && event.key === 's' && event.ctrlKey) {
                callback.current(event);
                catched = true
            }
            else if (key === 'ctrle' && event.key === 'e' && event.ctrlKey) {
                callback.current(event);
                catched = true
            }
            
            if (catched && preventDefault) {
                event.preventDefault()
            }

        }

        document.addEventListener('keydown', handle);
        return () => document.removeEventListener("keydown", handle)
    }, [key])
}