import { getSettings, saveSettings } from "@/lib/actions/settings";
import { loadAllPacks } from "@metier/core";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  let packs: { name: string; fileName: string }[] = [];
  try {
    const allPacks = await loadAllPacks();
    packs = allPacks.map((p) => ({
      name: p.name,
      fileName: p.name.toLowerCase().split(" ")[0],
    }));
  } catch {
    // Pack loading may fail in web context — non-critical
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-2 text-gray-500">Configure your AI provider and preferences.</p>

      <form action={saveSettings} className="mt-8 space-y-6">
        <div>
          <label htmlFor="ai_provider" className="block text-sm font-medium text-gray-700">
            AI Provider
          </label>
          <select
            id="ai_provider"
            name="ai_provider"
            defaultValue={settings?.ai_provider ?? ""}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">None (use default)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (GPT-4o)</option>
            <option value="deepseek">DeepSeek</option>
            <option value="minimax">MiniMax</option>
          </select>
        </div>

        <div>
          <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            id="api_key"
            name="api_key"
            type="password"
            defaultValue={settings?.api_key_encrypted ?? ""}
            placeholder="sk-..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Your key is stored in your Supabase account. We never see or use it.
          </p>
        </div>

        <div>
          <label htmlFor="default_industry" className="block text-sm font-medium text-gray-700">
            Default Industry
          </label>
          <select
            id="default_industry"
            name="default_industry"
            defaultValue={settings?.default_industry ?? ""}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Auto-detect from JD</option>
            {packs.map((p) => (
              <option key={p.fileName} value={p.fileName}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
