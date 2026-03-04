import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

export function ProfileMultiSelect({ label, options, selected, onChange, disabled }: Props) {
  const toggleOption = (option: string) => {
    if (disabled) return;
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-left text-sm font-medium">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            disabled={disabled}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              selected.includes(option)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-accent',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}


