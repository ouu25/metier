import type { Resume } from "@metier/core";
import { clsx } from "clsx";

interface ResumeDiffProps {
  original: Resume;
  rewritten: Resume;
}

export function ResumeDiff({ original, rewritten }: ResumeDiffProps) {
  return (
    <div className="space-y-6">
      <DiffSection
        title="Summary"
        original={original.summary}
        rewritten={rewritten.summary}
      />

      {rewritten.experience.map((exp, i) => {
        const orig = original.experience[i];
        return (
          <div key={i} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              {exp.title} @ {exp.company}
            </h4>
            {exp.bullets.map((bullet, j) => {
              const origBullet = orig?.bullets[j];
              return (
                <DiffLine
                  key={j}
                  original={origBullet ?? ""}
                  rewritten={bullet}
                />
              );
            })}
          </div>
        );
      })}

      <DiffSection
        title="Skills"
        original={original.skills.join(", ")}
        rewritten={rewritten.skills.join(", ")}
      />

      {original.certifications.join(", ") !==
        rewritten.certifications.join(", ") && (
        <DiffSection
          title="Certifications"
          original={original.certifications.join(", ")}
          rewritten={rewritten.certifications.join(", ")}
        />
      )}
    </div>
  );
}

function DiffSection({
  title,
  original,
  rewritten,
}: {
  title: string;
  original: string;
  rewritten: string;
}) {
  const changed = original !== rewritten;
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      {changed ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-xs font-medium text-red-700 mb-1">Original</p>
            <p className="text-sm text-red-900">{original}</p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
            <p className="text-xs font-medium text-green-700 mb-1">Rewritten</p>
            <p className="text-sm text-green-900">{rewritten}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No changes</p>
      )}
    </div>
  );
}

function DiffLine({
  original,
  rewritten,
}: {
  original: string;
  rewritten: string;
}) {
  if (original === rewritten) {
    return (
      <p className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
        {original}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <p className="text-sm text-red-800 pl-4 border-l-2 border-red-300 bg-red-50 rounded px-2 py-1">
        {original || <span className="italic text-gray-400">—</span>}
      </p>
      <p className="text-sm text-green-800 pl-4 border-l-2 border-green-300 bg-green-50 rounded px-2 py-1">
        {rewritten}
      </p>
    </div>
  );
}
