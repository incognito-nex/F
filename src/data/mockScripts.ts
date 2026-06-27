import { Script } from '../types/script';

export const MOCK_SCRIPTS: Script[] = [
  {
    id: 'sb-iy',
    title: 'Infinite Yield Admin Console v5.9',
    description: 'The ultimate universal Roblox admin command script. Over 400+ custom interactive commands including fly, speed, teleports, tools, and visual exploits.',
    gameName: 'Universal Admin',
    gameImage: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 1250490,
    likes: 85200,
    updatedAt: '2026-06-25T16:45:00Z',
    source: 'ScriptBlox',
    script: `-- Infinite Yield Admin v5.9
print("[ScriptHub] Loading Infinite Yield Admin Console...")
local success, err = pcall(function()
    loadstring(game:HttpGet("https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source"))()
end)
if success then
    print("[ScriptHub] Infinite Yield Admin loaded successfully!")
else
    warn("[ScriptHub] Failed to load from GitHub: " .. tostring(err))
    print("[ScriptHub] Running native fail-safe command parser...")
end`,
    features: 'Commands: ;fly, ;unfly, ;speed [num], ;jump [num], ;kill, ;teleport, ;noclip'
  },
  {
    id: 'rs-esp',
    title: 'scripts.net Premium ESP & Wallhack v3.5',
    description: 'Highly optimized vector drawing ESP script. Features high-contrast player bounding boxes, nametags, weapon displays, current health bars, and tracers.',
    gameName: 'Universal Visuals',
    gameImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 652010,
    likes: 41200,
    updatedAt: '2026-06-23T08:00:00Z',
    source: 'Rscripts',
    script: `-- scripts.net Premium Draw ESP Library
print("[scripts.net] Initializing Premium Draw ESP framework...")
local esp = {}
esp.Settings = {
    Boxes = true,
    Names = true,
    Tracers = false,
    Color = Color3.fromRGB(0, 255, 120)
}

-- ESP Vector drawing algorithms setup
print("[scripts.net] Draw Hooks successfully bound. Enjoy your visual advantage!")`,
    features: 'Highly optimized box rendering, distance indicators, health bars'
  },
  {
    id: 'sb-bf',
    title: 'Blox Fruits Auto-Farm Chests & Level Hub',
    description: 'Automates level farming, quest handling, island teleports, and fruit snatching. Auto-attacks nearest mobs and equips current best combat gears.',
    gameName: 'Blox Fruits',
    gameImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    verified: true,
    universal: false,
    key: true,
    views: 894500,
    likes: 54100,
    updatedAt: '2026-06-26T04:12:00Z',
    source: 'ScriptBlox',
    script: `-- Blox Fruits Auto-Farm v11.4
_G.AutoFarm = true
_G.AutoEquipWeapon = true
_G.ESPChests = true

spawn(function()
    while _G.AutoFarm do
        task.wait(1)
        print("[ScriptBlox] Searching for closest NPC or chest...")
        -- In-game positioning and farm automation hooks
    end
end)
print("[ScriptBlox] Blox Fruits Level & Chest farmer initialized.")`,
    features: 'Auto Quest, Fast Attack, Mastery Farm, Chest Collector, ESP'
  },
  {
    id: 'sb-dex',
    title: 'Dex Explorer v4 (Original Dark Edition)',
    description: 'Allows you to fully browse the in-game workspace hierarchy, download assets, modify attributes, and execute internal remotes directly.',
    gameName: 'Developer Tools',
    gameImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 310200,
    likes: 18400,
    updatedAt: '2026-05-15T11:05:00Z',
    source: 'ScriptBlox',
    script: `-- DarkDex Explorer Loader
print("[ScriptBlox] Injecting Dex Explorer Explorer...")
loadstring(game:HttpGet("https://raw.githubusercontent.com/infyiff/backup/main/dex.lua"))()
print("[ScriptBlox] Virtual workspace hierarchy loaded successfully.")`,
    features: 'Interactive GUI hierarchy explorer, remote caller, value editor'
  },
  {
    id: 'rs-aim',
    title: 'Universal Camera Aimbot & Target Locking',
    description: 'Flawless camera and mouse cursor locking module. Automatically filters out teammates, targets nearest heads, and adjusts field of view (FOV).',
    gameName: 'Universal Shooter',
    gameImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 431200,
    likes: 29400,
    updatedAt: '2026-06-20T10:11:00Z',
    source: 'Rscripts',
    script: `-- Camera Aimbot Module
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local Camera = workspace.CurrentCamera
local Mouse = LocalPlayer:GetMouse()

local function getClosestPlayer()
    local target, minDist = nil, math.huge
    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("Head") then
            local head = player.Character.Head
            local screenPos, onScreen = Camera:WorldToViewportPoint(head.Position)
            if onScreen then
                local dist = (Vector2.new(screenPos.X, screenPos.Y) - Vector2.new(Mouse.X, Mouse.Y)).Magnitude
                if dist < minDist then
                    minDist = dist
                    target = player
                end
            end
        end
    end
    return target
end

print("[Rscripts] Aimbot initiated. Press [E] to Lock On.")`,
    features: 'FOV ring circle, mouse tracing, team check filters'
  },
  {
    id: 'rs-mm2',
    title: 'Murder Mystery 2 Silent Aim & Coin Vacuum',
    description: 'Instantly teleports coins directly to your character model. Automatically highlights sheriff and murderer, with silent hitboxes for easy wins.',
    gameName: 'Murder Mystery 2',
    gameImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    verified: false,
    universal: false,
    key: false,
    views: 184300,
    likes: 9200,
    updatedAt: '2026-06-25T11:05:00Z',
    source: 'Rscripts',
    script: `-- MM2 Custom ESP & Coin Vacuum
_G.CoinVacuum = true
_G.MurdererESP = true

task.spawn(function()
    while _G.CoinVacuum do
        task.wait(0.2)
        -- MM2 Coin position offsets collector
    end
end)
print("[Rscripts] MM2 Ghost Multi-Hack activated successfully.")`,
    features: 'Silent Aim, Coin Vacuum, Sheriff & Murderer ESP alerts'
  },
  {
    id: 'sb-ps99',
    title: 'Pet Simulator 99 Infinite Auto-Hatch',
    description: 'Automates coin collecting and egg hatching. Spams premium egg modules in Pet Simulator 99 with lightning-fast speeds.',
    gameName: 'Pet Simulator 99',
    gameImage: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    verified: true,
    universal: false,
    key: true,
    views: 294100,
    likes: 15300,
    updatedAt: '2026-06-21T11:05:00Z',
    source: 'ScriptBlox',
    script: `-- Pet Simulator 99 Fast Auto-Egg Opener
_G.AutoHatchEgg = true
_G.TargetEggId = 85

spawn(function()
    while _G.AutoHatchEgg do
        game:GetService("ReplicatedStorage").API:InvokeServer("PurchaseEgg", _G.TargetEggId)
        task.wait(0.1)
    end
end)
print("[ScriptBlox] Egg farm activated for Egg ID: " .. _G.TargetEggId)`,
    features: 'Instant buy, lucky booster, fast animation skips'
  },
  {
    id: 'sb-hydro',
    title: 'Hydroxide Remote Spy & Packet Logger',
    description: 'Sophisticated packet debugging tool. Spies on remote events, logs network parameters, and automatically builds executable snippets.',
    gameName: 'Developer Tools',
    gameImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 94800,
    likes: 4500,
    updatedAt: '2026-04-10T08:00:00Z',
    source: 'ScriptBlox',
    script: `-- Hydroxide Remote Spy API
print("[ScriptBlox] Initializing Hydroxide Logger hooks...")
local spy = {
    hook = function(remote)
        print("[ScriptBlox RemoteSpy] Hooked Event: " .. remote.Name)
    end
}
-- Hydroxide dynamic hook metatables setup
print("[ScriptBlox] Packets listening on global Client-Server pipeline.")`,
    features: 'Remote event blocking, argument serialization, direct call replication'
  },
  {
    id: 'rs-bedwars',
    title: 'BedWars Combat Godmode & Instakill Bridge',
    description: 'Instantly structures bridge paths beneath you while walking. Killaura feature automatically targets enemy bed protection.',
    gameName: 'BedWars',
    gameImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    verified: false,
    universal: false,
    key: true,
    views: 312000,
    likes: 21900,
    updatedAt: '2026-06-26T21:40:00Z',
    source: 'Rscripts',
    script: `-- BedWars Multi-Combat Automation
_G.Killaura = true
_G.AutoBridge = true

print("[scripts.net] Bedwars combat bypass initialized. Auto-attack range: 12 studs.")`,
    features: 'Infinite jump, scaffolding bridge, killaura target logger'
  },
  {
    id: 'rs-simplespy',
    title: 'SimpleSpy Remote Logger v3.2',
    description: 'Fast, lightweight remote logger. Replicates Roblox game remote traffic with clean, color-coded diagnostic lines.',
    gameName: 'Developer Tools',
    gameImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 112000,
    likes: 6800,
    updatedAt: '2026-06-10T08:00:00Z',
    source: 'Rscripts',
    script: `-- SimpleSpy Loader
print("[scripts.net] Launching SimpleSpy Remote Event Spy...")
loadstring(game:HttpGet("https://raw.githubusercontent.com/exxtremestuffs/SimpleSpySource/master/SimpleSpy.lua"))()`,
    features: 'CJS serialization, log filtering, remote argument replacer'
  },
  {
    id: 'sb-fly',
    title: 'Universal Fly, Speed & Noclip Master v6',
    description: 'Standard physics bypassing controls. Alter walk speed up to 250, jump height up to 500, or float through collidable level walls.',
    gameName: 'Universal Movement',
    gameImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 289400,
    likes: 12100,
    updatedAt: '2026-06-22T10:11:00Z',
    source: 'ScriptBlox',
    script: `-- Fly, Speed, Jump, and Noclip controls
local Plr = game:GetService("Players").LocalPlayer
local Char = Plr.Character or Plr.CharacterAdded:Wait()
local Hum = Char:WaitForChild("Humanoid")

Hum.WalkSpeed = 45
Hum.JumpPower = 90

print("[ScriptBlox] WalkSpeed altered to 45, Jump power set to 90.")`,
    features: 'Flight toggle (F), adjustable numeric settings, noclip bypass'
  },
  {
    id: 'rs-fates',
    title: 'Fates Admin Console Hub v4.1',
    description: 'Modern administrative dashboard featuring visual sidebars, dynamic client commands, skin swapper, and client anti-lag optimizations.',
    gameName: 'Universal Admin',
    gameImage: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    verified: true,
    universal: true,
    key: false,
    views: 220100,
    likes: 14900,
    updatedAt: '2026-06-14T11:05:00Z',
    source: 'Rscripts',
    script: `-- Fates Admin Interface loader
print("[scripts.net] Loading Fates Admin panel...")
loadstring(game:HttpGet("https://raw.githubusercontent.com/fatesc/fates-admin/main/loader.lua"))()`,
    features: 'Custom hotkeys, 150+ administrative codes, UI customizer'
  },
  {
    id: 'sb-arsenal',
    title: 'Arsenal Silent Aim, Wallbang & ESP Hub',
    description: 'Guarantees 100% win rate in Arsenal. Features silent bullet redirects, hitboxes larger than heads, anti-recoil, and tracer walls.',
    gameName: 'Arsenal',
    gameImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    verified: false,
    universal: false,
    key: true,
    views: 543000,
    likes: 31200,
    updatedAt: '2026-06-25T08:00:00Z',
    source: 'ScriptBlox',
    script: `-- Arsenal God Hub
_G.SilentAim = true
_G.Wallbang = true
_G.ESP = true
print("[ScriptBlox] Arsenal God Mod loaded. Weapon offsets cleared.")`,
    features: 'Silent Aim, Direct Wallbang, Triggerbot, FOV Slider, No Recoil'
  },
  {
    id: 'rs-speedsim',
    title: 'Speed Simulator Auto-Rebirth & Gem Farm',
    description: 'Spams rebirth request commands to gain unlimited speed levels. Automatically collects map currency gems and steps into loops.',
    gameName: 'Speed Simulator',
    gameImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
    verified: false,
    universal: false,
    key: false,
    views: 120500,
    likes: 5400,
    updatedAt: '2026-06-19T11:05:00Z',
    source: 'Rscripts',
    script: `-- Auto Gems, Coins & Rebirth Simulator Loop
_G.Rebirthing = true

spawn(function()
    while _G.Rebirthing do
        game:GetService("ReplicatedStorage").Events.RebirthRequest:FireServer()
        game:GetService("ReplicatedStorage").Events.CollectGem:FireServer("GemModel")
        task.wait(0.2)
    end
end)
print("[scripts.net] Rebirth simulator automation is fully active.")`,
    features: 'Auto Rebirth, Multi Gem Hoover, anti-AFK bypass'
  },
  {
    id: 'sb-shindo',
    title: 'Shindo Life Auto-Quest & Spin Unlocker',
    description: 'Grinds scroll levels, unlocks premium bloodlines, and gathers scrolls. Auto-battles map boss clones for high tier drops.',
    gameName: 'Shindo Life',
    gameImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80',
    verified: true,
    universal: false,
    key: true,
    views: 412000,
    likes: 21000,
    updatedAt: '2026-06-15T09:30:00Z',
    source: 'ScriptBlox',
    script: `-- Shindo Life Grinder Pro
_G.AutoQuest = true
_G.BossFarm = true
print("[ScriptBlox] Shindo Life automation script listening to server ticks...")`,
    features: 'Boss teleporter, Quest helper, Bloodline generator bypass'
  }
];
