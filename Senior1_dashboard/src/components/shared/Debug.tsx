
export const Debug = ({ data }: any) => {
    return (
        <div className="text-center pb-8">
            <details className="inline-block">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-indigo-500 transition-colors">View Raw JSON Response</summary>
                <pre className="mt-4 text-left text-xs bg-slate-900 text-green-400 p-6 rounded-2xl overflow-auto max-h-60 max-w-4xl mx-auto shadow-2xl">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </details>
        </div>
    )
}
