# ShareScreen - P2P Screen Sharing

A beautiful, secure peer-to-peer screen sharing application built with Astro, React, and WebRTC. No servers required - your data stays between you and your viewers.

![ShareScreen Demo](https://via.placeholder.com/800x400/0a0a0a/007aff?text=ShareScreen+Demo)

## ✨ Features

- **🔒 100% Private**: Direct peer-to-peer connections with no data stored on servers
- **⚡ Ultra Fast**: Real-time streaming with minimal latency
- **🌍 Cross Platform**: Works on Windows, macOS, Linux, and mobile devices
- **🎨 Beautiful UI**: Apple-inspired dark theme design
- **📱 Mobile Friendly**: Responsive design that works great on any device
- **🔊 Audio Support**: Share screen with high-quality audio
- **🖥️ Fullscreen Mode**: Immersive viewing experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A modern web browser that supports WebRTC
- HTTPS connection (required for screen sharing APIs)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd screen-sharer-v2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4321`

### Building for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Use

### As a Host (Sharing Your Screen)

1. Click **"Share Your Screen"** on the home page
2. Click **"Start Sharing Screen"** 
3. Select the screen or window you want to share
4. Share the generated room code with your viewers
5. Viewers can join using any modern web browser

### As a Guest (Viewing a Screen)

1. Click **"Watch a Screen"** on the home page
2. Enter the room code provided by the host
3. Click **"Join Room"**
4. Enjoy the shared screen in high quality
5. Use fullscreen mode for an immersive experience

## 🔧 Technology Stack

- **Frontend Framework**: [Astro](https://astro.build) with React
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom Apple-inspired theme
- **WebRTC**: [PeerJS](https://peerjs.com) for simplified peer-to-peer connections
- **Icons**: [Lucide React](https://lucide.dev)
- **TypeScript**: Full type safety throughout the application

## 🌐 Browser Support

- Chrome 72+
- Firefox 66+
- Safari 13+
- Edge 79+
- Mobile browsers with WebRTC support

## 🔒 Privacy & Security

- **No Data Collection**: We don't store, log, or analyze your shared content
- **Direct Connections**: Your stream goes directly from host to viewer
- **Temporary Sessions**: Room codes expire when the session ends
- **Local Processing**: All video/audio processing happens on your device

## 🎨 Design Philosophy

ShareScreen follows Apple's Human Interface Guidelines with:

- Clean, minimal interface with focus on functionality
- Dark theme optimized for extended viewing
- Smooth animations and transitions
- Intuitive user flow with minimal steps
- Responsive design that works beautifully on all devices

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect your GitHub account to Vercel
3. Deploy with one click
4. Your app will be live with HTTPS automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Ensure your domain has HTTPS enabled

### Self-Hosting

1. Build the project: `npm run build`
2. Serve the `dist` folder with any static file server
3. **Important**: Ensure HTTPS is enabled (required for screen sharing)

## 🔧 Configuration

The app uses sensible defaults, but you can customize:

- **Video Quality**: Modify constraints in `src/utils/webrtc.ts`
- **Styling**: Update CSS variables in `src/styles/global.css`
- **STUN Servers**: Configure different ICE servers in the WebRTC setup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Astro](https://astro.build) for the amazing framework
- [PeerJS](https://peerjs.com) for simplifying WebRTC
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling
- [Lucide](https://lucide.dev) for the beautiful icons

---

**Made with ❤️ and modern web technologies**

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
