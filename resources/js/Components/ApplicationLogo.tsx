import { ImgHTMLAttributes } from "react";

export default function ApplicationLogo(
    props: ImgHTMLAttributes<HTMLImageElement>
) {
    return (
        <img {...props} src="/assets/logo-white.jpg" alt="Application Logo" />
    );
}
