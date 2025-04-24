// types/types.ts
export interface NavItem {
    label: string;
    href: string;
    children?: NavItem[];
    tag?: string;
}

export interface HeroSlide {
    id: number;
    type: string;
    src: string;
    title: string;
    subtitle: string;
    cta: {
        text: string;
        href: string;
    };
}
