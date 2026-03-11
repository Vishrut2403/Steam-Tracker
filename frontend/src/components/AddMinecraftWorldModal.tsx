import { useState, useEffect } from 'react';
import steamService from '../services/steam.service';

interface MinecraftWorld {
  name: string;
  path: string;
  playtime: number;
  instanceName: string;
}

interface MinecraftInstance {
  name: string;
  path: string;
  lastPlayed: Date | null;
  worlds: MinecraftWorld[];
}

interface AddMinecraftWorldModalProps {
  isOpen: boolean;
  userId: string;
  onAdd: () => Promise<void>;
  onClose: () => void;
}

export function AddMinecraftWorldModal({ isOpen, userId, onAdd, onClose }: AddMinecraftWorldModalProps) {
  const [instances, setInstances] = useState<MinecraftInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [selectedWorld, setSelectedWorld] = useState<MinecraftWorld | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadMinecraftInstances();
  }, [isOpen]);

  const loadMinecraftInstances = async () => {
    try {
      const response = await steamService.getMinecraftInstances();
      setInstances(response.instances || []);
    } catch (err) {
      console.error('Failed to load Minecraft instances:', err);
      alert('Failed to scan Prism Launcher. Make sure it\'s installed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceChange = (instanceName: string) => {
    setSelectedInstance(instanceName);
    setSelectedWorld(null);
  };

  const handleAddWorld = async () => {
    if (!selectedWorld) return;

    setSyncing(true);
    try {
      await steamService.syncMinecraftWorld({
        userId,
        worldPath: selectedWorld.path,
        worldName: selectedWorld.name,
        instanceName: selectedInstance,
      });

      await onAdd();
      onClose();
    } catch (err) {
      console.error('Failed to add Minecraft world:', err);
      alert('Failed to add world');
    } finally {
      setSyncing(false);
    }
  };

  const currentInstance = instances.find(i => i.name === selectedInstance);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          ⛏️ Add Minecraft World
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-400 mt-2">Scanning Prism Launcher...</p>
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No Prism Launcher instances found</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure Prism Launcher is installed at: ~/.local/share/PrismLauncher/
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Select Instance</label>
              <select
                value={selectedInstance}
                onChange={(e) => handleInstanceChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Choose an instance --</option>
                {instances.map(instance => (
                  <option key={instance.name} value={instance.name}>
                    {instance.name} ({instance.worlds.length} worlds)
                  </option>
                ))}
              </select>
            </div>

            {currentInstance && currentInstance.worlds.length > 0 && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">Select World</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentInstance.worlds.map((world: MinecraftWorld) => {
                    const hours = Math.floor(world.playtime / 60);
                    const minutes = world.playtime % 60;

                    return (
                      <button
                        key={world.path}
                        onClick={() => setSelectedWorld(world)}
                        className={`w-full p-4 rounded-lg border transition-all text-left ${
                          selectedWorld?.path === world.path
                            ? 'bg-blue-900/30 border-blue-500/50'
                            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-semibold text-white">{world.name}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Playtime: {hours}h {minutes}m
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentInstance && currentInstance.worlds.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                No worlds found in this instance
              </div>
            )}

            {selectedWorld && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-white mb-3">World Preview</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">World Name:</span>
                    <span className="text-white ml-2">{selectedWorld.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Instance:</span>
                    <span className="text-white ml-2">{selectedInstance}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Playtime:</span>
                    <span className="text-white ml-2">
                      {Math.floor(selectedWorld.playtime / 60)}h {selectedWorld.playtime % 60}m
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddWorld}
                disabled={!selectedWorld || syncing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 font-semibold"
              >
                {syncing ? 'Adding...' : 'Add World'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}