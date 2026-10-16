import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  label: string;
  /** `null` es "ninguno". Base UI no reconoce "" como vacío y enseñaría otra opción. */
  value: string | null;
}

interface OptionSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
}

/** Desplegable sencillo a partir de una lista de opciones. */
export function OptionSelect({ options, value, onChange, id }: OptionSelectProps) {
  return (
    <Select items={options} value={value} onValueChange={(next) => onChange(next ?? null)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value ?? "none"} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
