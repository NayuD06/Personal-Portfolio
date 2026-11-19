"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Gõ lần lượt từng chữ trong danh sách rồi xóa đi, lặp lại. Máy bật "giảm chuyển động" thì đứng yên ở chữ đầu. */
export function Typewriter({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <span>
        <span className="sr-only">{words.join(", ")}</span>
        <span aria-hidden="true">{words[0]}</span>
      </span>
    );
  }
  return <Typing words={words} />;
}

/** Phần gõ chữ. Tạm dừng khi cuộn khỏi màn hình cho đỡ tốn (không phải vẽ lại mỗi 35–75ms khi không ai nhìn thấy). */
function Typing({ words }: { words: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
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
  }, [text, deleting, index, words, visible]);

  return (
    <span ref={ref}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden="true">
        {text}
        <span className="caret ml-0.5 inline-block w-[3px] translate-y-[3px] bg-brand-sky" style={{ height: "1em" }} />
      </span>
    </span>
  );
}
