import { PropsWithChildren } from "react";
import BehaviorShortNames from "./behavior-short-names.json";

interface KeyProps {
  selected?: boolean;
  width: number;
  height: number;
  oneU: number;
  header?: string;
  onClick?: () => void;
}

interface BehaviorShortName {
  short?: string;
}

const MAX_HEADER_LENGTH = 9;
const shortNames: Record<string, BehaviorShortName> = BehaviorShortNames;

const shortenHeader = (header: string | undefined) => {
  if(typeof header === "undefined"){
    return "";
  }
  // Empty string is a valid header for behaviors where we don't want to see a header, which is falsy
  // So we use an undefined check here
  if(typeof shortNames[header]?.short !== "undefined"){
    return shortNames[header].short;
  } else if(header.length > MAX_HEADER_LENGTH){
    const words = header.split(/[\s,-]+/);
    const lettersPerWord = Math.trunc(MAX_HEADER_LENGTH / words.length);
    return words.map((word) => (word.substring(0,lettersPerWord))).join("");
  } else {
    return header;
  }
}

export const Key = ({
  selected = false,
  width,
  height,
  oneU,
  header,
  onClick,
  children,
}: PropsWithChildren<KeyProps>) => {
  const pixelWidth = width * oneU - 2;
  const pixelHeight = height * oneU - 2;

  const shortHeader = shortenHeader(header);
  return (
    <button
      className={`group rounded relative flex justify-center items-center cursor-pointer transition-colors hover:ring-1 hover:ring-gray-300 ${selected ? "bg-primary text-primary-content" : "bg-base-100 text-base-content"
        }`}
      style={{
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
      }}
      onClick={onClick}
    >
      {shortHeader && (
        <div
          className={`absolute top-0.5 left-1/2 -translate-x-1/2 text-xs leading-none px-1.5 py-0.5 rounded-md border text-nowrap truncate max-w-[90%] ${
            selected
              ? "border-primary-content/50 bg-primary-content/15 text-primary-content"
              : "border-base-content/30 bg-base-content/10 text-base-content/80"
          }`}
        >
          {shortHeader}
        </div>
      )}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          shortHeader ? "pt-3.5" : ""
        }`}
      >
        {children}
      </div>
    </button>
  );
};
