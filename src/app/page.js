"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useFormik } from "formik";
import { Eraser, Send } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";

export default function Home() {
  const [chats, setChats] = useState([]);

  const form = useFormik({
    initialValues: {
      input: "",
    },
    validationSchema: Yup.object().shape({
      input: Yup.string().required(),
    }),
    onSubmit: async ({ input }, helpers) => {
      helpers.setSubmitting(true);
      setChats((oldChats) => [...oldChats, { user: input }]);
      let output = "Oops! Something went wrong.";
      const res = await fetch("/api", { method: "POST", redirect: "follow", body: input })
        if (res.ok) {
            output = (await res.json())['output'] ?? ""
        }
      setChats((oldChats) => [...oldChats, { ai: output }]);
      helpers.setSubmitting(false);
      if (output != "Oops! Something went wrong.") {
        helpers.resetForm({ input: "" });
      }
    },
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        className="fixed top-2 right-2"
        onClick={() => setChats([])}
      >
        <span className="flex justify-end gap-2">
          <Eraser className="rotate-0 fill-current" />
          Clear Chat
        </span>
      </Button>
      <div className="w-screen h-screen max-w-lg mx-auto flex flex-col p-4">
        <div id="chatbox" className="flex-1 flex flex-col justify-end">
          {chats.length < 1 && (
            <div
              id="chatbox-empty"
              className="flex-1 flex justify-center items-center"
            >
              <span className="p-4 flex flex-col gap-3">
                <p className="text-center">👋 Langflow Chat</p>
                <small className="max-w-72 text-center text-muted-foreground">
                  Start a conversation and ask questions on social media post
                  analystics
                </small>
              </span>
            </div>
          )}
          {chats.map((chat, index) => (
            <span
              key={index}
              className={`my-1 p-1 flex flex-col gap-1 px-2 rounded-lg ${
                Object.keys(chat)[0] == "user"
                  ? "self-end bg-secondary"
                  : "self-start"
              }`}
            >
              <small>{Object.keys(chat)[0] == "user" ? "You" : "AI"}</small>
              <span className="text-sm text-muted-foreground">
                <MarkdownPreview
                  source={Object.values(chat)[0]}
                  className="bg-background"
                  style={{
                    background: "transparent",
                    fontSize: "small",
                    padding: 0,
                    margin: 0,
                  }}
                />
                {/* {Object.values(chat)[0]} */}
              </span>
            </span>
          ))}
          {form.isSubmitting && (
            <span className={`p-1 flex flex-col gap-1 self-start`}>
              <Skeleton className={"h-3 w-6"} />
              <Skeleton className={"h-3 w-20"} />
            </span>
          )}
        </div>
        <form
          id="chatinput"
          className="py-4 flex items-end gap-2"
          onSubmit={form.handleSubmit}
        >
          <Textarea
            placeholder="Type a message"
            name="input"
            id="input"
            className="min-h-[none]"
            value={form.values.input}
            onChange={form.handleChange("input")}
            onBlur={form.handleBlur("input")}
            disabled={form.isSubmitting}
          />
          <Button
            size="icon"
            type="submit"
            onClick={form.handleSubmit}
            disabled={!form.isValid || form.isSubmitting}
          >
            <Send className=" rotate-45" fill="currentColor" />
          </Button>
        </form>
      </div>
    </>
  );
}
