# JARVIS Hologram Desktop

Giao diện desktop hologram toàn màn hình — phong cách siêu máy tính JARVIS, kết hợp công nghệ (3D, HUD, metrics thật) với yếu tố huyền học phương Tây (magic circle) và Đạo giáo (bát quái, phù chú).

![Windows 11](https://img.shields.io/badge/Windows-11%20%7C%2010-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D%2018-green)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Tính năng

- **Cảnh 3D** — Quả cầu hologram nhiều lớp, shader GLSL, bloom, parallax (React Three Fiber)
- **HUD sống** — CPU, RAM, GPU, mạng, process, uptime… đọc **thật** từ Windows
- **Chủ đề mystic** — Vòng tròn ma thuật, bát quái, phù chú quay quanh tâm
- **Desktop wallpaper** — Hai chế độ triển khai:
  - **Lively Wallpaper** (khuyên dùng trên Windows 11 24H2+)
  - **Electron** (gắn trực tiếp vào desktop layer)

---

## Yêu cầu hệ thống

| Thành phần | Phiên bản |
|------------|-----------|
| Windows | 10 / 11 (đã test trên 11 build 26200) |
| Node.js | 18 trở lên |
| npm | 9 trở lên |
| Lively Wallpaper | Bản Store hoặc cài đặt thường (cho chế độ wallpaper) |
| WebView2 | Cần cho Lively web wallpaper |

---

## Cài đặt nhanh

```powershell
git clone https://github.com/bachlong12623/jarvis-hologram-desktop.git
cd jarvis-hologram-desktop
npm install
```

---

## Chế độ phát triển (xem trên trình duyệt)

Chạy metrics server + Vite dev server:

```powershell
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`. HUD sẽ hiển thị dữ liệu hệ thống thật qua proxy `/api` → port `3742`.

---

## Đặt làm wallpaper — Lively (khuyên dùng)

> **Tại sao dùng Lively?** Windows 11 24H2 thay đổi cách render desktop; Electron wallpaper có thể không hiển thị đúng. Lively Wallpaper ổn định hơn trên các bản Windows mới.

### Bước 1 — Cài Lively Wallpaper

Tải từ [Microsoft Store](https://apps.microsoft.com/store/detail/lively-wallpaper/9ntm2qc6lrsx) hoặc [GitHub Lively](https://github.com/rocksdanister/lively).

### Bước 2 — Build & deploy package

```powershell
npm run wallpaper:lively
```

Script sẽ:
1. Build production (`dist/`)
2. Đóng gói wallpaper web (`Type: 1`) vào thư mục Lively
3. Khởi động metrics server
4. Copy vào `%LOCALAPPDATA%\Lively Wallpaper\Library\wallpapers\jarvis-hologram`

### Bước 3 — Áp dụng trong Lively

1. Mở **Lively Wallpaper**
2. Chuột phải thư viện → **Refresh** (hoặc khởi động lại Lively)
3. Chọn **JARVIS Hologram** → **Apply**

### Bước 4 — Metrics server khi khởi động Windows

HUD cần server metrics chạy nền. Sau lần chạy `wallpaper:lively`, script `start-metrics.ps1` đã được tạo.

Chạy thủ công:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-metrics.ps1
```

Tự chạy khi đăng nhập — tạo shortcut trong Startup:

```powershell
$startup = [Environment]::GetFolderPath('Startup')
$wsh = New-Object -ComObject WScript.Shell
$lnk = $wsh.CreateShortcut("$startup\JARVIS-Metrics.lnk")
$lnk.TargetPath = 'powershell.exe'
$lnk.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PWD\scripts\start-metrics.ps1`""
$lnk.WorkingDirectory = $PWD
$lnk.Save()
```

### Xử lý sự cố Lively

| Lỗi / Triệu chứng | Cách xử lý |
|-------------------|------------|
| `WallpaperPluginNotFoundException` / MSIX program not allowed | Package phải là **web** (`Type: 1`). Chạy lại `npm run wallpaper:lively` |
| Màn hình đen / không load | Lively → **Settings → Wallpaper → Web Browser → WebView2** |
| HUD hiện `OFFLINE` | Chạy `scripts\start-metrics.ps1`, kiểm tra `http://127.0.0.1:3742/api/health` |

---

## Đặt làm wallpaper — Electron (thay thế)

```powershell
# Chạy một lần
npm run wallpaper

# Cài tự khởi động khi đăng nhập Windows
npm run wallpaper:install
```

Dừng wallpaper:

```powershell
npm run wallpaper:stop
```

Log: `%LOCALAPPDATA%\JARVIS-Wallpaper\wallpaper.log`

> Trên Windows 11 24H2+, nếu desktop vẫn hiện wallpaper Bloom mặc định, hãy dùng **Lively** thay vì Electron.

---

## Ẩn / hiện icon Desktop

Để giao diện hologram sạch hơn:

1. Chuột phải vùng trống trên **Desktop**
2. **View** → bỏ tick **Show desktop icons** (ẩn)
3. Bật lại tick để hiện icon

**Ẩn taskbar tự động:** Settings → Personalization → Taskbar → Taskbar behaviors → **Automatically hide the taskbar**

### Toggle bằng PowerShell (tùy chọn)

```powershell
$path = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
$current = (Get-ItemProperty -Path $path -Name HideIcons -ErrorAction SilentlyContinue).HideIcons
Set-ItemProperty -Path $path -Name HideIcons -Value ($(if ($current -eq 1) { 0 } else { 1 }))
Stop-Process -Name explorer -Force
```

---

## Scripts npm

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Metrics server + Vite dev |
| `npm run build` | Build production vào `dist/` |
| `npm run server` | Chỉ chạy metrics server (port 3742) |
| `npm run wallpaper:lively` | Build + deploy Lively package |
| `npm run wallpaper` | Build + chạy Electron wallpaper |
| `npm run wallpaper:install` | Cài shortcut Startup (Electron) |
| `npm run wallpaper:stop` | Dừng Electron wallpaper |
| `npm run wallpaper:dev` | Dev mode với Electron wallpaper |
| `npm run lint` | Chạy Oxlint |

---

## Cấu trúc dự án

```
├── src/
│   ├── components/          # Scene 3D + HUD overlay
│   │   ├── hud/             # Panels, gauges, talismans
│   │   ├── HologramSphere.tsx
│   │   ├── MagicCircle.tsx
│   │   ├── TaoBagua.tsx
│   │   └── Experience.tsx
│   └── hooks/
│       └── useSystemMetrics.ts
├── server/
│   ├── index.ts             # Express API :3742
│   └── collectMetrics.ts    # Thu thập metrics Windows
├── electron/
│   ├── main.cjs             # Electron wallpaper window
│   └── wallpaper-win.cjs    # Win32 desktop attach
├── scripts/
│   ├── setup-lively.ps1     # Deploy Lively wallpaper
│   ├── start-metrics.ps1    # Khởi động metrics server
│   ├── start-wallpaper.ps1  # Khởi động Electron wallpaper
│   ├── install-wallpaper.ps1
│   └── toggle-desktop-icons.ps1  # Ẩn/hiện icon desktop
└── lively-template/
    └── LivelyInfo.json      # Metadata package Lively
```

---

## API Metrics

| Endpoint | Mô tả |
|----------|--------|
| `GET /api/health` | Trạng thái server |
| `GET /api/metrics` | CPU, RAM, GPU, network, processes… |

Port mặc định: **3742** (đổi bằng biến `METRICS_PORT`).

---

## Công nghệ sử dụng

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 8](https://vitejs.dev)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei) + [Postprocessing](https://github.com/pmndrs/postprocessing)
- [Express](https://expressjs.com) + [systeminformation](https://github.com/sebhildebrandt/systeminformation)
- [Electron](https://www.electronjs.org) + [Lively Wallpaper](https://github.com/rocksdanister/lively)

---

## Giấy phép

MIT — tự do sử dụng, chỉnh sửa và phân phối.
