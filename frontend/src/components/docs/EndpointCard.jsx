import clsx from "clsx";
import CodeBlock from "./CodeBlock";

const METHOD_CLASSES = {
  GET: "bg-brand-500/10 text-brand-600",
  POST: "bg-mint-400/15 text-mint-500",
};

export default function EndpointCard({ id, method, path, title, description, params, example, response }) {
  return (
    <div id={id} className="glossy-card rounded-2xl p-6 scroll-mt-32">
      <div className="flex items-center gap-2.5 mb-2">
        <span className={clsx("text-xs font-bold px-2 py-1 rounded-md font-mono", METHOD_CLASSES[method])}>{method}</span>
        <code className="text-sm text-ink-800 font-mono">{path}</code>
      </div>
      <h3 className="font-semibold text-ink-900 mb-1.5">{title}</h3>
      <p className="text-sm text-ink-600 leading-relaxed mb-4">{description}</p>

      {params && params.length > 0 && (
        <div className="mb-5 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-ink-400 text-xs uppercase tracking-wide">
                <th className="py-1.5 pr-4">Param</th>
                <th className="py-1.5 pr-4">Type</th>
                <th className="py-1.5">Description</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name} className="border-t border-ink-50">
                  <td className="py-1.5 pr-4 font-mono text-xs text-brand-700">{p.name}</td>
                  <td className="py-1.5 pr-4 text-ink-500 text-xs">{p.type}</td>
                  <td className="py-1.5 text-ink-600 text-xs">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {example && (
          <div>
            <p className="text-xs font-semibold text-ink-500 mb-2">Request</p>
            <CodeBlock code={example} language="bash" />
          </div>
        )}
        {response && (
          <div>
            <p className="text-xs font-semibold text-ink-500 mb-2">Response</p>
            <CodeBlock code={response} language="json" />
          </div>
        )}
      </div>
    </div>
  );
}
