import { useEffect, useState } from "react";

export function useDelayedFlag(condition: boolean, delayMs: number): boolean {
    const [flag, setFlag] = useState(false);

    useEffect(() => {
        if (!condition) {
            setFlag(false);
            return;
        }
        const timer = setTimeout(() => setFlag(true), delayMs);
        return () => clearTimeout(timer);
    }, [condition, delayMs]);

    return flag;
}