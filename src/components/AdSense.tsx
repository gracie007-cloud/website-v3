import { useEffect } from "react";

interface AdSenseProps {
    client: string;
    slot: string;
    format?: string;
    responsive?: string;
    className?: string;
    style?: React.CSSProperties;
}

export function AdSense({
    client,
    slot,
    format = "auto",
    responsive = "true",
    className,
    style,
}: AdSenseProps) {
    const isDev = import.meta.env.DEV;

    useEffect(() => {
        if (isDev) return;

        try {
            // @ts-expect-error: adsbygoogle is not defined on window in basic types
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, [isDev]);

    if (isDev) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 text-gray-500 font-mono text-sm p-4 ${
                    className || ""
                }`}
                style={{
                    display: "flex",
                    minHeight: "100px",
                    textAlign: "center",
                    ...style,
                }}
            >
                AdSense Placeholder
                <br />
                (Slot: {slot})
            </div>
        );
    }

    return (
        <ins
            className={`adsbygoogle ${className || ""}`}
            style={{ display: "block", ...style }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
        />
    );
}
