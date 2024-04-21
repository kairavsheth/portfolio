'use client';
import React, {useEffect, useRef, useState} from 'react';
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import {AnimatePresence, motion} from "framer-motion";

interface Element {
    tag: string;
    attributes: { [key: string]: string };
    children: (Element | string)[];
    selfClosing: boolean;
    wrap: boolean;
}

const raw: Element =
    {
        tag: "div",
        attributes: {class: "container"},
        wrap: true,
        children: [{
            tag: 'div',
            attributes: {class: "content"},
            wrap: true,
            children: [{
                tag: 'div',
                attributes: {class: "name-group"},
                wrap: true,
                children: [
                    {
                        tag: "h2",
                        attributes: {},
                        children: ["Namaste, I am"],
                        selfClosing: false,
                        wrap: false
                    }, {
                        tag: "h1",
                        attributes: {class: "name"},
                        children: ["Kairav Nitin Sheth"],
                        selfClosing: false,
                        wrap: false
                    }, {
                        tag: "p",
                        wrap: true,
                        children: [
                            "A web developer, cyber-security enthusiast &",
                            {
                                tag: 'br',
                                attributes: {},
                                children: [],
                                selfClosing: true,
                                wrap: false
                            },
                            "a defence services aspirant"],
                        attributes: {},
                        selfClosing: false
                    }],
                selfClosing: false
            }, {
                tag: "div",
                attributes: {class: 'socials'},
                children: [{
                    tag: 'a',
                    attributes: {href: 'https://github.com/kairavsheth'},
                    children: [{
                        tag: 'img',
                        attributes: {class: 'icon', src: '/icons/gh.svg'},
                        children: [],
                        selfClosing: true,
                        wrap: false
                    }],
                    wrap: false,
                    selfClosing: false
                }, {
                    tag: 'a',
                    attributes: {href: 'https://linkedin.com/in/kairavsheth'},
                    children: [{
                        tag: 'img',
                        attributes: {class: 'icon', src: '/icons/li.svg'},
                        children: [],
                        selfClosing: true,
                        wrap: false
                    }],
                    selfClosing: false,
                    wrap: false
                }],
                selfClosing: false,
                wrap: true
            }
            ],
            selfClosing: false,
        }, {
            tag: "style",
            attributes: {},
            selfClosing: false,
            children: [
                `h1, h2, h3, p { margin: 0 }
.container {
    background: #061330; color: #ffffff; width: 100vw; height: 100vh;
    font-family: \"Bricolage Grotesque\", sans-serif;
    font-weight: 600; font-size: x-large;
    display: flex; flex-direction: column; justify-content: center;
}
.content { padding: 5vmin; display: flex; flex-direction: column; gap: 15px; }
.socials { display: flex; align-items: center; gap: 10px; }
`,
            ],
            wrap: true
        }],
        selfClosing: false,
    }
;

function Typing() {

    const [typed, setTyped] = useState("");
    const [typing, setTyping] = useState(false);
    const herodiv = useRef<HTMLDivElement>(null);

    function buildAttributes(attributes: { [key: string]: string }) {
        if (!attributes) return '';
        return Object.entries(attributes).reduce((acc, [key, value]) => acc + ` ${key}="${value}"`, '');
    }

    function openingTag(el: Element) {
        return `<${el.tag}${buildAttributes(el.attributes)}>`;
    }

    function closingTag(el: Element) {
        return `</${el.tag}>`;
    }

    function selfClosingTag(el: Element) {
        return `<${el.tag}${buildAttributes(el.attributes)} />`;
    }

    async function compile(el: Element, cb = (s: string) => s) {
        if (el.selfClosing) {
            const tag = selfClosingTag(el);
            for (let i = 0; i < tag.length; i++) {
                cb(tag.slice(0, i + 1));
                await gap();
            }
            return tag + (el.wrap ? '\n' : '');
        }
        const opening = openingTag(el);
        const closing = closingTag(el);
        for (let i = 0; i < opening.length - 1; i++) {
            cb(opening.slice(0, i + 1));
            await gap();
        }
        let c = '';
        const _cb = (s: string) => cb(opening + (el.wrap ? '\n' : '') + c + s + closing);

        _cb('');
        await gap();

        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];
            if (typeof child === 'string') {
                for (let j = 0; j < child.length; j++) {
                    _cb(child.slice(0, j + 1));
                    await gap();
                }
                c = c + child + (el.wrap ? '\n' : '');
            } else {
                c = c + await compile(child, (s) => _cb(s)) + (el.wrap ? '\n' : '');
            }
        }
        return opening + (el.wrap ? '\n' : '') + c + closing;
    }

    useEffect(() => {
        const block_inherit = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Fira+Mono:wght@400;500;700&display=swap" rel="stylesheet"><style>:host {all : initial;}</style>`;

        const shadow = document.createElement('div');
        shadow.id = 'shadowroot';
        herodiv.current!.appendChild(shadow);
        const shadowroot = document.getElementById('shadowroot')!.attachShadow({mode: 'open'});
        setTyping(true);
        compile(raw, (s) => {
            setTyped(s);
            shadowroot.innerHTML = block_inherit + s;
            return s;
        }).then(() => setTimeout(() => setTyping(false), 1000));
        return () => {
            document.getElementById('shadowroot')!.remove();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div>
            <AnimatePresence>
                {typing && <motion.div
                    key={"my_unique_key"}
                    exit={{opacity: 0}}
                    initial={{opacity: 0}}
                    animate={{opacity: 0.35}}
                    className="absolute top-0 left-0 z-10 opacity-35 bg-white w-screen h-screen overflow-hidden"
                >
                    <SyntaxHighlighter customStyle={{background: 'transparent'}}>{(typed)}</SyntaxHighlighter>
                </motion.div>}
            </AnimatePresence>
            <div className="absolute top-0 left-0 w-screen h-screen z-0" ref={herodiv}></div>
        </div>
    )
        ;
}

async function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function gap() {
    await timeout(1);
}

export default Typing;