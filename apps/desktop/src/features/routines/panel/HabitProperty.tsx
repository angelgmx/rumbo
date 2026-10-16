import { FlameIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";

/** El hábito que marca la rutina al cumplirse, además de los de sus bloques. */
export function HabitProperty({
  habit,
  onChange,
}: {
  habit: string | undefined;
  onChange: (habit: string | undefined) => void;
}) {
  const habits = useRumbo().habits.list();
  const current = habits.find((summary) => summary.habit.key === habit);

  return (
    <PropertyRow
      label="Hábito"
      empty="Sin hábito"
      value={
        current && (
          <>
            <FlameIcon className="size-4 text-muted-foreground" />
            <span className="truncate">{current.habit.name}</span>
          </>
        )
      }
      width="w-72"
    >
      {(close) => (
        <OptionList
          options={habits.map(({ habit: { key, name } }) => ({ value: key, label: name }))}
          value={habit}
          clearLabel="Sin hábito"
          onChoose={(key) => {
            onChange(key);
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
