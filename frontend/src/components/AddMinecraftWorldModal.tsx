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
		<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
			<div className="bg-[#000000] rounded-lg p-6 max-w-2xl w-full border border-[#333333] max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold text-[#e5e5e5] mb-4 flex items-center gap-2">
					⛏️ Add Minecraft World
				</h2>

				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin w-8 h-8 border-2 border-[#5a7fa3] border-t-transparent rounded-full mx-auto" />
						<p className="text-[#a0a0a0] mt-2">Scanning Prism Launcher...</p>
					</div>
				) : instances.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-[#a0a0a0]">No Prism Launcher instances found</p>
						<p className="text-sm text-[#696969] mt-2">
							Make sure Prism Launcher is installed at: ~/.local/share/PrismLauncher/
						</p>
						<button
							onClick={onClose}
							className="mt-4 px-4 py-2 bg-[#1a1a1a] text-[#a0a0a0] rounded border border-[#333333] hover:bg-[#333333]"
						>
							Close
						</button>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<label className="block text-sm text-[#a0a0a0] mb-2">Select Instance</label>
							<select
								value={selectedInstance}
								onChange={(e) => handleInstanceChange(e.target.value)}
								className="w-full px-3 py-2 bg-[#1a1a1a] text-[#e5e5e5] rounded border border-[#333333] focus:border-[#5a7fa3] focus:outline-none"
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
								<label className="block text-sm text-[#a0a0a0] mb-2">Select World</label>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{currentInstance.worlds.map((world) => (
										<button
											key={world.path}
											onClick={() => setSelectedWorld(world)}
											className={`w-full p-3 text-left rounded border transition-all ${
												selectedWorld?.path === world.path
													? 'bg-[#5a7fa3] border-[#7a9fc3] text-[#e5e5e5]'
													: 'bg-[#1a1a1a] border-[#333333] text-[#a0a0a0] hover:bg-[#333333]'
											}`}
										>
											<div className="font-medium">{world.name}</div>
											<div className="text-xs mt-1 opacity-75">{Math.round(world.playtime / 60)}h playtime</div>
										</button>
									))}
								</div>
							</div>
						)}

						<div className="flex gap-3 pt-4">
							<button
								onClick={handleAddWorld}
								disabled={!selectedWorld || syncing}
								className={`flex-1 py-2 px-4 rounded font-semibold ${
									!selectedWorld || syncing
										? 'bg-[#333333] cursor-not-allowed text-[#696969]'
										: 'bg-[#5a7fa3] hover:bg-[#7a9fc3] text-[#e5e5e5]'
								} transition-colors`}
							>
								{syncing ? 'Adding...' : 'Add World'}
							</button>
							<button
								onClick={onClose}
								disabled={syncing}
								className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-[#a0a0a0] rounded font-semibold transition-colors disabled:opacity-50 border border-[#333333]"
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