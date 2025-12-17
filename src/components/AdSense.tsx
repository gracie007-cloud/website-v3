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
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

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
