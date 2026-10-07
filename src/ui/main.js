// OWNER: Member E | Wire input, Send, Reset, Retry to answer()
// RULE: the UI must only call answer(text) from the engine and never compute similarity itself
import { answer } from "../engine/index.js";
import { addMessage, clearChat } from "./chat.js";
// TODO: event listeners
