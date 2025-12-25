import { featureComparison } from "./data";
import { Check, Minus } from "lucide-react";

function renderCell(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-primary" aria-label="Included" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" aria-label="Not included" />
    );
  }
  return <span className="text-sm text-foreground">{value}</span>;
}

export function FeatureTable() {
  return (
    <section className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">Feature comparison</h2>
        <p className="text-sm text-muted-foreground">
          Transparency across every capability and plan.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <th className="py-3 pr-6">Capability</th>
              <th className="py-3 pr-6">Free</th>
              <th className="py-3 pr-6">Pro</th>
              <th className="py-3 pr-6">Team</th>
            </tr>
          </thead>
          <tbody>
            {featureComparison.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="py-4 pr-6 text-sm font-medium text-foreground">
                  {row.label}
                </th>
                {[row.free, row.pro, row.team].map((value, index) => (
                  <td key={index} className="py-4 pr-6">
                    {renderCell(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

