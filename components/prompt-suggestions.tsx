import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";

const suggestions = [
  {
    text: "Weather in Dubai",
    prompt: "What's the weather in Dubai?",
  },
  {
    text: "Get the latest Vercel blog post",
    prompt: "Go to vercel.com/blog and get the latest post",
  },
  {
    text: "Create a new text file",
    prompt:
      "Open a text editor and create a new file called notes.txt and write 'we are so back!'",
  },
  {
    text: "Get the latest rauchg tweet",
    prompt: "Go to twitter.com/rauchg and get the latest tweet",
  },
];

export const PromptSuggestions = ({
  submitPrompt,
  disabled,
}: {
  submitPrompt: (prompt: string) => void;
  disabled: boolean;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="pill"
          size="pill"
          onClick={() => submitPrompt(suggestion.prompt)}
          disabled={disabled}
        >
          <span>
            <span className="text-black text-sm">
              {suggestion.text.toLowerCase()}
            </span>
          </span>
          <ArrowUpRight className="ml-1 h-2 w-2 sm:h-3 sm:w-3 text-zinc-500 group-hover:opacity-70" />
        </Button>
      ))}
    </div>
  );
};
