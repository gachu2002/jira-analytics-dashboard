import { useMemo, useState } from 'react'

import { ChevronDown, ChevronRight, Code2 } from 'lucide-react'

type FilterTagChipsProps = {
  filters?: string[]
  jql: string
}

const keywordRegex =
  /\b(project|AND|issuetype|IN|NOT|status|sprint|ORDER BY|DESC|ASC)\b/

export const FilterTagChips = ({ filters = [], jql }: FilterTagChipsProps) => {
  const [expanded, setExpanded] = useState(false)
  const tokens = useMemo(() => jql.split(keywordRegex), [jql])

  return (
    <section>
      <button
        className="mb-2 inline-flex items-center gap-2 bg-transparent p-0 text-[11px] text-[var(--text-muted)]"
        onClick={() => setExpanded((state) => !state)}
        type="button"
      >
        <Code2 size={12} strokeWidth={1.5} />
        JQL Filter
        {expanded ? (
          <ChevronDown size={11} strokeWidth={1.5} />
        ) : (
          <ChevronRight size={11} strokeWidth={1.5} />
        )}
      </button>

      {expanded ? (
        <pre className="jql-block whitespace-pre-wrap">
          <code>
            {tokens.map((token, index) => {
              if (
                /^(project|AND|issuetype|IN|NOT|status|sprint|ORDER BY|DESC|ASC)$/.test(
                  token,
                )
              ) {
                return (
                  <span className="jql-keyword" key={`${token}-${index}`}>
                    {token}
                  </span>
                )
              }

              if (/^".*"$/.test(token.trim())) {
                return (
                  <span className="jql-value" key={`${token}-${index}`}>
                    {token}
                  </span>
                )
              }

              return <span key={`${token}-${index}`}>{token}</span>
            })}
          </code>
        </pre>
      ) : null}

      {filters.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filters.map((filter) => (
            <span
              className="border-border rounded-[2px] border px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
              key={filter}
            >
              {filter}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
