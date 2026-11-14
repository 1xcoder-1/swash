import type { CSSProperties, ReactNode } from "react";

export type EchoTrigger = "hover" | "always" | "view";

export interface EchoProps {
  children: ReactNode;
  /** How many trailing copies follow the text. Default 3. */
  count?: number;
  /** Time between one echo and the next, in ms. Default 400. */
  delay?: number;
  /** How long one echo takes to fade out, in ms. Default 1600. */
  duration?: number;
  /** How far an echo spreads from the text, as a scale. Default 1.16. */
  spread?: number;
  /** A CSS colour for the echoes. Default "currentColor". */
  color?: string;
  /** When the trail runs. Default "always". */
  trigger?: EchoTrigger;
  className?: string;
  style?: CSSProperties;
}
