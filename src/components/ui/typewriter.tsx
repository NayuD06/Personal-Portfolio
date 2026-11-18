"use client";

import { useEffect, useState } from "react";

/** Gõ lần lượt từng chữ trong danh sách rồi xóa đi, lặp lại. */
export function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let delay = deleting ? 35 : 75;
    if (!deleting && text === word) delay = 1700;
    if (deleting && text === "") delay = 300;

    const timer = setTimeout(() => {
      if (!deleting && text === word) {
        setDeleting(true);
      } else if (deleting && text === "") {
        setDeleting(false);
        setIndex((i) => i + 1);
      } else {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, index, words]);

  return (
    <span>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden="true">
        {text}
        <span className="caret ml-0.5 inline-block w-[3px] translate-y-[3px] bg-brand-sky" style={{ height: "1em" }} />
      </span>
    </span>
  );
}
