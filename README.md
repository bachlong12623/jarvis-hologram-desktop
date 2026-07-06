# JARVIS Hologram Desktop

Giao diện desktop hologram toàn màn hình cho **[Lively Wallpaper](https://github.com/rocksdanister/lively)** — phong cách siêu máy tính JARVIS, HUD metrics Windows thật, đồng hồ/lịch tiếng Việt, kết hợp magic circle phương Tây và phù chú/bát quái Đạo giáo.

**Repository:** https://github.com/bachlong12623/jarvis-hologram-desktop

![Windows 11](https://img.shields.io/badge/Windows-11%20%7C%2010-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D%2018-green)
![Lively](https://img.shields.io/badge/Wallpaper-Lively-purple)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Tổng quan

Dự án gồm hai phần chạy song song:

| Thành phần | Vai trò |
|------------|---------|
| **Web UI** (`src/`) | Cảnh 3D + HUD, render bởi Lively qua WebView2 |
| **Metrics server** (`server/`) | API localhost cung cấp CPU/RAM/GPU/network thật cho HUD |

Wallpaper được đóng gói từ `lively-template/LivelyInfo.json` (Type **1** = web/HTML) — tương thích bản Lively Microsoft Store (MSIX).

---

## Tính năng

### Cảnh 3D (React Three Fiber)
- Quả cầu hologram nhiều lớp, shader GLSL tùy chỉnh, bloom & vignette
- Vòng xử lý (processing rings), data streams, sàn mạch điện
- **Magic circle** vàng — xoay ngẫu nhiên 3 trục quanh tâm (không còn vạch ngang cố định)
- **Bát quái** đỏ và phù chú quay quanh tâm
- Parallax theo chuột

### HUD overlay
- Gauge CPU / MEM / NET / GPU
- Biểu đồ sparkline, waveform, CPU cores, bảng process
- Data log, module grid, status bar
- Magic circle SVG + phù chú CSS orbiting

### Đồng hồ & lịch
- Đồng hồ số `HH:MM:SS` cập nhật mỗi giây
- Ngày đầy đủ tiếng Việt
- Lịch tháng dạng lưới, highlight ngày hôm nay
- Vị trí: góc dưới bên phải

### Tối ưu hiệu năng (wallpaper mode)
Tự kích hoạt khi chạy trong Lively/WebView2 (`file:` hoặc `chrome.webview`):

| Thông số | Dev (trình duyệt) | Wallpaper (Lively) |
|----------|-------------------|---------------------|
| FPS render 3D | ~60 | **24** |
| DPR | 1–1.5x | **1x** |
| Bloom mipmapBlur | Bật | **Tắt** |
| Chromatic aberration | Bật | **Tắt** |
| Poll metrics | 1s | **3s** |
| Waveform canvas | 60fps | **12fps** |
| Tạm dừng render | — | Khi desktop ẩn |

---

## Yêu cầu hệ thống

| Thành phần | Phiên bản / Ghi chú |
|------------|---------------------|
| Windows | 10 / 11 (đã test Win11 build 26200) |
| Node.js | 18 trở lên |
| npm | 9 trở lên |
| Lively Wallpaper | [Store](https://apps.microsoft.com/store/detail/lively-wallpaper/9ntm2qc6lrsx) hoặc [GitHub](https://github.com/rocksdanister/lively) |
| WebView2 | Bắt buộc — Lively → Settings → Wallpaper → Web Browser → **WebView2** |

---

## Cài đặt

```powershell
git clone https://github.com/bachlong12623/jarvis-hologram-desktop.git
cd jarvis-hologram-desktop
npm install
```

---

## Phát triển (xem trên trình duyệt)

```powershell
npm run dev
```

- UI: `http://localhost:5173`
- Metrics API: `http://127.0.0.1:3742` (proxy qua Vite `/api`)

Chỉ chạy metrics server:

```powershell
npm run server
```

Build production:

```powershell
npm run build
```

---

## Deploy lên Lively Wallpaper

### Bước 1 — Cài Lively

Tải và cài Lively Wallpaper (Store hoặc bản portable).

### Bước 2 — Deploy package

```powershell
npm run deploy
```

Script `scripts/deploy-lively.ps1` sẽ:

1. `npm run build` → tạo `dist/`
2. Đóng gói với `lively-template/LivelyInfo.json` vào thư mục tạm
3. Khởi động metrics server
4. Copy vào:
   ```
   %LOCALAPPDATA%\Lively Wallpaper\Library\wallpapers\jarvis-hologram
   ```

### Bước 3 — Áp dụng trong Lively

1. Mở **Lively Wallpaper**
2. Chuột phải thư viện → **Refresh** (hoặc restart Lively)
3. Chọn **JARVIS Hologram** → **Apply**

### Bước 4 — Metrics khi khởi động Windows (khuyên dùng)

HUD cần metrics server chạy nền. Cài vào Startup:

```powershell
npm run metrics:install
```

Gỡ khỏi Startup:

```powershell
npm run metrics:uninstall
```

Chạy thủ công:

```powershell
npm run metrics
```

Kiểm tra server:

```
http://127.0.0.1:3742/api/health
```

---

## `lively-template`

Manifest Lively — **không sửa `Type` thành 0** (program bị chặn trên MSIX Store):

```json
{
  "Type": 1,
  "FileName": "index.html",
  "Title": "JARVIS Hologram"
}
```

Vite build dùng `base: './'` để asset load đúng trong WebView2.

---

## Ẩn / hiện icon Desktop

Giao diện sạch hơn khi ẩn icon:

1. Chuột phải vùng trống Desktop → **View**
2. Bỏ tick **Show desktop icons**

Toggle bằng script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\toggle-desktop-icons.ps1
```

**Ẩn taskbar tự động:** Settings → Personalization → Taskbar → **Automatically hide the taskbar**

---

## Xử lý sự cố

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| `WallpaperPluginNotFoundException` | Package kiểu program (Type 0) | Chạy lại `npm run deploy` — phải là Type 1 |
| Màn hình đen / không load | WebView thiếu | Lively → Web Browser → **WebView2** |
| HUD hiện `OFFLINE` | Metrics server tắt | `npm run metrics` hoặc `npm run metrics:install` |
| CPU cao (`msedgewebview2.exe`) | WebGL render liên tục | Lively → Pause khi fullscreen; app đã giới hạn 24fps |
| Không thấy thay đổi sau build | Cache Lively | Refresh thư viện hoặc restart Lively |

---

## Scripts npm

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Metrics server + Vite dev |
| `npm run server` | Chỉ metrics server (port 3742) |
| `npm run build` | Build production → `dist/` |
| `npm run preview` | Xem bản build local |
| `npm run deploy` | Build + deploy package Lively |
| `npm run metrics` | Khởi động metrics server |
| `npm run metrics:install` | Thêm `JARVIS-Metrics.lnk` vào Windows Startup |
| `npm run metrics:uninstall` | Gỡ shortcut Startup |
| `npm run lint` | Chạy Oxlint |

---

## Cấu trúc dự án

```
jarvis-hologram-desktop/
├── src/
│   ├── components/
│   │   ├── Experience.tsx         # Canvas R3F + postprocessing
│   │   ├── HologramSphere.tsx     # Quả cầu hologram chính
│   │   ├── MagicCircle.tsx        # Vòng ma thuật 3D (xoay ngẫu nhiên)
│   │   ├── TaoBagua.tsx           # Bát quái đỏ
│   │   ├── DataStreams.tsx        # Particle streams
│   │   ├── ProcessingRings.tsx    # Vòng xử lý
│   │   ├── CircuitPlatform.tsx    # Sàn mạch
│   │   ├── RenderLoop.tsx         # Giới hạn FPS wallpaper
│   │   ├── HudOverlay.tsx         # HUD tổng
│   │   └── hud/
│   │       ├── DateTimeClock.tsx  # Đồng hồ + lịch
│   │       ├── RadialGauge.tsx
│   │       ├── Sparkline.tsx
│   │       ├── Waveform.tsx
│   │       ├── ProcessTable.tsx
│   │       ├── TaoTalismans.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── useSystemMetrics.ts    # Poll metrics API
│   │   └── useMouseParallax.ts
│   ├── shaders/hologram.ts        # GLSL shaders
│   └── utils/
│       ├── performanceMode.ts     # Profile hiệu năng wallpaper
│       └── hudData.ts
├── server/
│   ├── index.ts                   # Express :3742
│   └── collectMetrics.ts          # systeminformation
├── lively-template/
│   └── LivelyInfo.json            # Manifest Lively (Type 1)
├── scripts/
│   ├── deploy-lively.ps1          # Build + deploy
│   ├── start-metrics.ps1          # Chạy metrics nền
│   ├── install-metrics-startup.ps1
│   ├── uninstall-metrics-startup.ps1
│   └── toggle-desktop-icons.ps1
├── vite.config.ts                 # base: './' cho Lively
└── dist/                          # Build output (gitignored)
```

---

## API Metrics

| Endpoint | Mô tả |
|----------|--------|
| `GET /api/health` | `{ ok, port, ready }` |
| `GET /api/metrics` | CPU, RAM, GPU, network, processes, uptime, hostname… |

- Port mặc định: **3742**
- Đổi port: biến môi trường `METRICS_PORT`

---

## Công nghệ

| Layer | Stack |
|-------|--------|
| UI | React 19, TypeScript, Vite 8 |
| 3D | Three.js, React Three Fiber, Postprocessing |
| HUD | CSS + Canvas 2D |
| Backend | Express 5, systeminformation |
| Wallpaper | Lively Wallpaper + WebView2 |

---

## Lịch sử thay đổi chính

- **v1.0** — Chỉ dùng Lively (đã gỡ Electron)
- HUD metrics Windows thật, đồng hồ/lịch tiếng Việt
- Tối ưu CPU cho WebView2 (24fps, giảm postprocessing)
- Magic circle xoay ngẫu nhiên 3 trục

---

## Giấy phép

MIT — tự do sử dụng, chỉnh sửa và phân phối.
