"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "../ui/input";

type Props = {
  // The search text currently applied (it lives in the URL)
  value: string;
  onSearch: (text: string) => void;
};

// The search box. It waits until the user stops typing before it searches.
export function CourseSearch({ value, onSearch }: Props) {
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The back button or "Clear filters" changed the URL: show the new text.
  // (Setting state while rendering is the React way to follow a prop without an effect.)
  const [applied, setApplied] = useState(value);
  if (value !== applied) {
    setApplied(value);
    if (text.trim() !== value) setText(value);
  }

  function change(next: string) {
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next.trim()), 350);
  }

  function clear() {
    clearTimeout(timer.current);
    setText("");
    onSearch("");
  }

  return (
    <div className="relative w-full">
      <label htmlFor="course-search" className="sr-only">
        Search courses
      </label>
      <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="course-search"
        type="search"
        value={text}
        onChange={(event) => change(event.target.value)}
        placeholder="Search courses or categories"
        className="h-12 rounded-xl bg-white pr-11 pl-12 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}