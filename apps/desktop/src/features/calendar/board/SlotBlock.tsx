import { timeOf } from "@rumbo/core";
import type { CSSProperties } from "react";
import { TimePill } from "../events/TimePill";
import type { SlotSpan } from "../gestures/Gestures";
import { offsetOf, type MinuteRange } from "./geometry";

export const SLOT_CLASS =
  "pointer-events-none absolute inset-x-0.5 z-10 rounded-md border border-dashed border-primary bg-primary/10 p-1.5";

export function slotStyle(span: SlotSpan, range: MinuteRange): CSSProperties {
  return {
    top: offsetOf(span.start, range),
    height: offsetOf(span.end, range) - offsetOf(span.start, range),
  };
}

export function SlotPill({ span }: { span: SlotSpan }) {
  return <TimePill start={timeOf(span.start)} end={timeOf(span.end)} color="var(--primary)" />;
}

/** Dónde caerá lo que se arrastra o se está creando: un recuadro discontinuo con su hora. */
export function SlotBlock({ span, range }: { span: SlotSpan; range: MinuteRange }) {
  return (
    <div className={SLOT_CLASS} style={slotStyle(span, range)}>
      <SlotPill span={span} />
    </div>
  );
}
